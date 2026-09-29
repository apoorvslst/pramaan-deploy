import { Tender } from '../models/Tender.js';
import { AuditLedgerService } from '../services/auditLedger.js';

export const createTender = async (req, res) => {
  try {
    const {
      title,
      tenderNumber,
      department,
      estimatedValueINR,
      closingDate,
      rules,
    } = req.body;

    if (!title || !estimatedValueINR) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and estimatedValueINR.',
      });
    }

    const generatedTenderNo = tenderNumber || `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`;

    const tender = new Tender({
      title,
      tenderNumber: generatedTenderNo,
      department: department || 'Ministry of Heavy Industries / Public Procurement',
      estimatedValueINR,
      closingDate: closingDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdBy: req.user?._id,
      rules: {
        minimumTurnoverINR: rules?.minimumTurnoverINR ?? Math.round(estimatedValueINR * 0.3),
        turnoverYearsRequired: rules?.turnoverYearsRequired || 3,
        minimumExperienceYears: rules?.minimumExperienceYears || 2,
        makeInIndiaPercentage: rules?.makeInIndiaPercentage || 20,
        allowStartupExemption: rules?.allowStartupExemption ?? true,
        allowMSMEExemption: rules?.allowMSMEExemption ?? true,
        emdRequired: rules?.emdRequired ?? true,
        emdAmountINR: rules?.emdAmountINR ?? Math.round(estimatedValueINR * 0.02),
        requiredCertificates: rules?.requiredCertificates || [
          { type: 'GST_CERTIFICATE', isMandatory: true, weightage: 20 },
          { type: 'UDYAM_CERTIFICATE', isMandatory: true, weightage: 20 },
          { type: 'PAN_CARD', isMandatory: true, weightage: 15 },
          { type: 'CA_TURNOVER_CERTIFICATE', isMandatory: true, weightage: 25 },
          { type: 'DEBARMENT_AFFIDAVIT', isMandatory: true, weightage: 20 },
        ]
      }
    });

    await tender.save();

    // Record block in Audit Ledger
    await AuditLedgerService.recordEvent({
      actionType: 'TENDER_CREATED',
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Procurement Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip
      },
      entityId: tender._id,
      payloadData: {
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        estimatedValueINR: tender.estimatedValueINR,
        rules: tender.rules
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tender created successfully',
      tender,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllTenders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tenderNumber: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const tenders = await Tender.find(query)
      .populate('createdBy', 'name email designation department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tenders.length,
      tenders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTenderById = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('createdBy', 'name email designation department');

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      });
    }

    return res.status(200).json({
      success: true,
      tender,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTender = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      });
    }

    if (tender.status === 'PUBLISHED' || tender.status === 'EVALUATION') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify rules after tender is published or in evaluation without administrative override.',
      });
    }

    Object.assign(tender, req.body);
    await tender.save();

    await AuditLedgerService.recordEvent({
      actionType: 'TENDER_RULES_UPDATED',
      actor: {
        userId: req.user?._id,
        name: req.user?.name,
        role: req.user?.role,
        ipAddress: req.ip
      },
      entityId: tender._id,
      payloadData: {
        tenderId: tender._id,
        updatedFields: Object.keys(req.body)
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Tender updated successfully',
      tender,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const publishTender = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      });
    }

    tender.status = 'PUBLISHED';
    tender.publishedDate = new Date();
    tender.auditRootHash = AuditLedgerService.hash(tender.rules);
    await tender.save();

    const auditBlock = await AuditLedgerService.recordEvent({
      actionType: 'TENDER_PUBLISHED',
      actor: {
        userId: req.user?._id,
        name: req.user?.name || 'Officer',
        role: req.user?.role || 'OFFICER',
        ipAddress: req.ip
      },
      entityId: tender._id,
      payloadData: {
        tenderId: tender._id,
        tenderNumber: tender.tenderNumber,
        status: 'PUBLISHED',
        auditRootHash: tender.auditRootHash,
        publishedAt: tender.publishedDate
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Tender published and cryptographically sealed into Audit Ledger.',
      tender,
      auditBlock
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    AI Tender Rule & Specification Drafting Assistant (Groq LLM)
 * @route   POST /api/tenders/ai-assist
 * @access  Private (OFFICER)
 */
export const generateAITenderDraft = async (req, res) => {
  try {
    const { title, department, estimatedValueINR, category, requirements } = req.body;
    const val = Number(estimatedValueINR) || 10000000;
    const dept = department || 'Ministry of Heavy Industries';
    const cat = category || 'Public Procurement & Services';

    const groqKey = process.env.GROQ_API_KEY;
    let aiRules = {
      standardTitle: title || 'Procurement of Statutory Equipment & Works',
      minimumTurnoverINR: Math.round(val * 0.3),
      turnoverYearsRequired: 3,
      minimumExperienceYears: 3,
      makeInIndiaPercentage: 50,
      allowStartupExemption: true,
      allowMSMEExemption: true,
      emdAmountINR: Math.round(val * 0.02),
      mandatoryDocuments: [
        'GST Registration Certificate (Form GST REG-06)',
        'CA Certified Turnover Certificate (Avg >= 30% of Tender Value)',
        'Permanent Account Number (PAN Card)',
        'Udyam MSME Certificate / DPIIT Startup Certificate',
        'Non-Debarment / Anti-Blacklisting Affidavit'
      ],
      aiComplianceJustification: `Standardized in accordance with General Financial Rules (GFR 2017) Rule 149 and DPIIT Public Procurement Order 2017.`
    };

    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an expert Government of India Public Procurement Legal Advisor specialized in GeM & CPPP statutory rules under GFR 2017.
Generate standardized statutory tender parameters and criteria for an official Notice Inviting Tender (NIT).

Return STRICTLY valid JSON with structure:
{
  "standardTitle": string,
  "minimumTurnoverINR": number,
  "turnoverYearsRequired": number,
  "minimumExperienceYears": number,
  "makeInIndiaPercentage": number,
  "allowStartupExemption": boolean,
  "allowMSMEExemption": boolean,
  "emdAmountINR": number,
  "mandatoryDocuments": string[],
  "aiComplianceJustification": string
}`
              },
              {
                role: 'user',
                content: `Tender Scope/Title: "${title || 'Supply of Solar Power Inverters'}"
Department: "${dept}"
Estimated Value INR: ${val}
Category: "${cat}"
Additional Requirements: "${requirements || 'Standard statutory GeM compliance'}"`
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 450,
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const parsed = JSON.parse(groqData.choices?.[0]?.message?.content || '{}');
          if (parsed.standardTitle) {
            aiRules = { ...aiRules, ...parsed };
          }
        }
      } catch (err) {
        console.warn('[AI Tender Draft Warning]', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      draft: aiRules
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

