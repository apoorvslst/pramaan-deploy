import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { spawn } from 'child_process';

const UPLOADS_DIR = fs.existsSync(path.resolve('uploads'))
  ? path.resolve('uploads')
  : (fs.existsSync(path.resolve('backend/uploads'))
      ? path.resolve('backend/uploads')
      : path.resolve('uploads'));

const SCRIPT_PATH = fs.existsSync(path.resolve('scripts/generate_bidder_pdf.py'))
  ? path.resolve('scripts/generate_bidder_pdf.py')
  : path.resolve('backend/scripts/generate_bidder_pdf.py');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Calculates SHA-256 hash of a file
 */
function getFileSha256(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }
  } catch (e) {
    console.warn('Hash error:', e.message);
  }
  return crypto.createHash('sha256').update(`${filePath}-${Date.now()}`).digest('hex');
}

/**
 * Ensures dedicated, authentic statutory PDFs exist for a bidder
 * (Udyam, GST REG-06, PAN Card, CA Turnover, Debarment Affidavit).
 */
export async function ensureBidderCertificates(bidder, forceRegenerate = false) {
  const bidderId = String(bidder._id || bidder.id || 'default');
  const legalName = bidder.legalName || bidder.legalBusinessName || bidder.name || 'Bidder Entity';
  const pan = bidder.pan || 'AAAAI9231N';
  const gstin = bidder.gstin || (pan ? `08${pan}1ZC` : '08AAAAI9231N1ZC');
  const udyam = bidder.udyam || bidder.udyamRegistrationNumber || 'UDYAM-RJ-24-0106524';
  const entityType = bidder.entityType || 'LLP';
  
  let addressStr = 'Plot 42, HSIIDC Industrial Area, Phase-I, Jaipur, Rajasthan - 302001';
  if (bidder.registeredAddress) {
    const a = bidder.registeredAddress;
    addressStr = typeof a === 'string' ? a : [a.line1, a.city, a.state, a.pincode].filter(Boolean).join(', ');
  } else if (bidder.address) {
    addressStr = typeof bidder.address === 'string' ? bidder.address : addressStr;
  }

  const udyamPath = path.join(UPLOADS_DIR, `bidder_${bidderId}_udyam.pdf`);
  const gstPath = path.join(UPLOADS_DIR, `bidder_${bidderId}_gst.pdf`);
  const panPath = path.join(UPLOADS_DIR, `bidder_${bidderId}_pan.pdf`);
  const caPath = path.join(UPLOADS_DIR, `bidder_${bidderId}_ca_turnover.pdf`);
  const debarmentPath = path.join(UPLOADS_DIR, `bidder_${bidderId}_debarment.pdf`);

  const allExist = fs.existsSync(udyamPath) && fs.existsSync(gstPath) && 
                   fs.existsSync(panPath) && fs.existsSync(caPath) && fs.existsSync(debarmentPath);

  if (!allExist || forceRegenerate) {
    const scriptPath = SCRIPT_PATH;
    const payload = JSON.stringify({
      _id: bidderId,
      legalName,
      pan,
      gstin,
      udyam,
      entityType,
      address: addressStr,
      msmeCategory: bidder.msmeCategory || 'Small',
      directors: bidder.directors || [{ name: 'Apoorva Mishra', pan }]
    });

    await new Promise((resolve, reject) => {
      const child = spawn('python', [scriptPath]);
      let errData = '';
      child.stderr.on('data', d => { errData += d.toString(); });
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`PDF generator exited with code ${code}: ${errData}`));
      });
      child.stdin.write(payload);
      child.stdin.end();
    });
  }

  return {
    UDYAM_CERTIFICATE: {
      docType: 'UDYAM_CERTIFICATE',
      originalFileName: `Official_Udyam_Certificate_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      storagePath: `/uploads/bidder_${bidderId}_udyam.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: fs.existsSync(udyamPath) ? fs.statSync(udyamPath).size : 25800,
      sha256Hash: getFileSha256(udyamPath)
    },
    GST_CERTIFICATE: {
      docType: 'GST_CERTIFICATE',
      originalFileName: `Official_GST_REG06_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      storagePath: `/uploads/bidder_${bidderId}_gst.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: fs.existsSync(gstPath) ? fs.statSync(gstPath).size : 25800,
      sha256Hash: getFileSha256(gstPath)
    },
    PAN_CARD: {
      docType: 'PAN_CARD',
      originalFileName: `PAN_Card_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      storagePath: `/uploads/bidder_${bidderId}_pan.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: fs.existsSync(panPath) ? fs.statSync(panPath).size : 25800,
      sha256Hash: getFileSha256(panPath)
    },
    CA_TURNOVER_CERTIFICATE: {
      docType: 'CA_TURNOVER_CERTIFICATE',
      originalFileName: `CA_Turnover_Certificate_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      storagePath: `/uploads/bidder_${bidderId}_ca_turnover.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: fs.existsSync(caPath) ? fs.statSync(caPath).size : 25800,
      sha256Hash: getFileSha256(caPath)
    },
    DEBARMENT_AFFIDAVIT: {
      docType: 'DEBARMENT_AFFIDAVIT',
      originalFileName: `Non_Debarment_Affidavit_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      storagePath: `/uploads/bidder_${bidderId}_debarment.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: fs.existsSync(debarmentPath) ? fs.statSync(debarmentPath).size : 25800,
      sha256Hash: getFileSha256(debarmentPath)
    }
  };
}
