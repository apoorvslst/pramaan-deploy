/**
 * PRAMAN — Per-Tender Cartel, Proxy & Collusion Graph Datasets
 * ═════════════════════════════════════════════════════════════
 * Provides detailed, tender-wise bipartite entity relationship networks
 * including nodes, edges, collusion clusters, implicated entities,
 * and shared statutory attributes for every tender in the system.
 */

export const TENDER_COLLUSION_DATASETS = {
  // ─── TENDER 1: IT Network Infrastructure (MeitY) ───
  'TND-2026-GEM-48291': {
    tenderId: 'TND-2026-GEM-48291',
    tenderTitle: 'Procurement of IT Network Infrastructure Equipment',
    department: 'Ministry of Electronics and Information Technology (MeitY)',
    estimatedValueINR: 48500000,
    category: 'IT Hardware & Networking',
    closingDate: '2026-10-15',
    totalBidders: 8,
    collusionRisk: 'CRITICAL',
    cartelClustersCount: 1,
    banner: {
      severity: 'CRITICAL',
      title: 'Syndicate Bidding Detected — Immediate Disqualification Review Required',
      description: 'Apex Infotech Solutions (BID-004) and NewEdge IT Infra (BID-006) share a common Director (DIN: 09876543 — Vikram S. Mehta), overlapping registered addresses at Nehru Place, New Delhi (PIN 110019), similar phone ranges (+91-98765-00XXX), and identical PDF Author metadata DESKTOP-APEX01. This constitutes a CRITICAL cartel risk under CVC Public Procurement Guidelines.',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 185,
      ry: 125,
      label: 'COLLUSION CLUSTER: HIGH RISK',
      subLabel: 'DIN, Address & PDF Author Nexus',
      severity: 'CRITICAL'
    },
    nodes: [
      {
        id: 'BID-004',
        label: 'Apex Infotech\nSolutions Pvt. Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 280,
        y: 220,
        r: 25,
        details: { gstin: '07AAFCA3456J1Z9', score: '34/100', role: 'Cartel Ring Member A', quoteINR: 44000000 }
      },
      {
        id: 'BID-006',
        label: 'NewEdge IT Infra\nPvt. Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 550,
        y: 220,
        r: 25,
        details: { gstin: '07AANPN2345L1Z5', score: '28/100', role: 'Cartel Ring Member B', quoteINR: 52500000 }
      },
      {
        id: 'DIR-098',
        label: 'Vikram S. Mehta\nDIN: 09876543',
        type: 'director',
        x: 415,
        y: 110,
        r: 19,
        details: { designation: 'Common Director', mcaStatus: 'Active DIN on MCA21', linkedBidders: 'BID-004, BID-006' }
      },
      {
        id: 'META-APEX01',
        label: 'DESKTOP-APEX01\n(PDF Author)',
        type: 'meta',
        x: 415,
        y: 220,
        r: 19,
        details: { software: 'Adobe Photoshop CC 2024 / MS Word', creator: 'DESKTOP-APEX01', linkedBidders: 'BID-004, BID-006' }
      },
      {
        id: 'ADDR-110019',
        label: 'Nehru Place\nPIN 110019',
        type: 'address',
        x: 415,
        y: 310,
        r: 19,
        details: { city: 'New Delhi', pin: '110019', building: 'Block-B, Nehru Place', proximity: 'Identical floor & premise' }
      },
      {
        id: 'PHONE-9876500',
        label: '+91-98765-00XXX\n(Similar Range)',
        type: 'phone',
        x: 275,
        y: 340,
        r: 19,
        details: { telco: 'Airtel Enterprise', block: '98765-00001 / 98765-00002', risk: 'Consecutive Corporate SIMs' }
      },
      {
        id: 'BID-002',
        label: 'TechVista LLP\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 140,
        y: 120,
        r: 21,
        details: { gstin: '27AADCT5678G1Z3', score: '87/100', role: 'Clean Bidder', quoteINR: 47200000 }
      },
      {
        id: 'BID-001',
        label: 'Bharat NetSolutions\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 690,
        y: 340,
        r: 21,
        details: { gstin: '07AABCN1234F1Z5', score: '92/100', role: 'Clean Bidder', quoteINR: 49500000 }
      },
    ],
    edges: [
      { from: 'BID-004', to: 'DIR-098', label: 'Director', type: 'director', isCollusion: true },
      { from: 'BID-006', to: 'DIR-098', label: 'Director', type: 'director', isCollusion: true },
      { from: 'BID-004', to: 'META-APEX01', label: 'PDF Author', type: 'meta', isCollusion: true },
      { from: 'BID-006', to: 'META-APEX01', label: 'PDF Author', type: 'meta', isCollusion: true },
      { from: 'BID-004', to: 'ADDR-110019', label: 'Address', type: 'address', isCollusion: true },
      { from: 'BID-006', to: 'ADDR-110019', label: 'Address', type: 'address', isCollusion: true },
      { from: 'BID-004', to: 'PHONE-9876500', label: 'Phone Range', type: 'phone', isCollusion: true },
      { from: 'BID-006', to: 'PHONE-9876500', label: 'Phone Range', type: 'phone', isCollusion: true },
    ],
    implicatedEntities: [
      {
        id: 'BID-004',
        legalName: 'Apex Infotech Solutions Pvt. Ltd.',
        gstin: '07AAFCA3456J1Z9',
        address: '42, Nehru Place, Block-B, New Delhi - 110019',
        score: 34,
        quoteINR: 44000000,
        severity: 'CRITICAL',
        collusionNote: 'Shares common director DIN: 09876543 with BID-006. Submissions created on identical machine DESKTOP-APEX01.'
      },
      {
        id: 'BID-006',
        legalName: 'NewEdge IT Infra Pvt. Ltd.',
        gstin: '07AANPN2345L1Z5',
        address: '44, Nehru Place, Block-B, New Delhi - 110019',
        score: 28,
        quoteINR: 52500000,
        severity: 'CRITICAL',
        collusionNote: 'Cover bid designed to make BID-004 appear lowest qualifying. Shares DIN: 09876543 and phone block +91-98765-00XXX.'
      }
    ],
    sharedAttributes: [
      { title: 'Common Director Interlock', detail: 'DIN: 09876543 — Vikram S. Mehta', type: 'director', severity: 'CRITICAL' },
      { title: 'Physical Address Proximity', detail: '42 & 44 Nehru Place, Block-B, PIN 110019', type: 'address', severity: 'HIGH' },
      { title: 'Digital Forensic Metadata', detail: 'PDF Author: DESKTOP-APEX01 (Match: 100%)', type: 'meta', severity: 'CRITICAL' },
      { title: 'Telecom Block Overlap', detail: '+91-98765-00001 & +91-98765-00002', type: 'phone', severity: 'MEDIUM' }
    ]
  },

  // ─── TENDER 2: Solar Rooftop Inverters (Ministry of Heavy Industries) ───
  'GEM/2026/B/901245': {
    tenderId: 'GEM/2026/B/901245',
    tenderTitle: 'High-Capacity 500kW Solar Rooftop Inverters & Grid Interfaces',
    department: 'Ministry of Heavy Industries & Public Enterprises',
    estimatedValueINR: 25000000,
    category: 'Renewable Energy Systems',
    closingDate: '2026-10-22',
    totalBidders: 6,
    collusionRisk: 'CRITICAL',
    cartelClustersCount: 1,
    banner: {
      severity: 'CRITICAL',
      title: 'Digital Footprint & Financial Nexus Alert — Cartel Ring #C-104',
      description: 'Apex InfraTech (BID-8903) and GreenVolt Power Systems (BID-8904) submitted financial bids within 4 minutes from identical IP subnet 103.24.112.44. Forensic cross-matching reveals common Director DIN: 08912441 (S. K. Aggarwal) and shared Bank Branch (HDFC Connaught Place).',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 185,
      ry: 125,
      label: 'CARTEL RING #C-104: CRITICAL RISK',
      subLabel: 'Identical Subnet IP & Bank Interlock',
      severity: 'CRITICAL'
    },
    nodes: [
      {
        id: 'BID-8903',
        label: 'Apex InfraTech\nSolutions Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 280,
        y: 220,
        r: 25,
        details: { gstin: '07AAACA1122D1Z8', score: '38/100', role: 'Collusion Partner A', quoteINR: 23800000 }
      },
      {
        id: 'BID-8904',
        label: 'GreenVolt Power\nSystems Pvt. Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 550,
        y: 220,
        r: 25,
        details: { gstin: '07AABCG3344K1Z4', score: '31/100', role: 'Collusion Partner B', quoteINR: 24900000 }
      },
      {
        id: 'DIR-891',
        label: 'S. K. Aggarwal\nDIN: 08912441',
        type: 'director',
        x: 415,
        y: 110,
        r: 19,
        details: { designation: 'Designated Partner', mcaStatus: 'Verified MCA21 Registry', linkedBidders: 'BID-8903, BID-8904' }
      },
      {
        id: 'IP-103',
        label: 'IP: 103.24.112.44\n(Same Subnet)',
        type: 'ip',
        x: 415,
        y: 220,
        r: 19,
        details: { subnet: '103.24.112.0/24', isp: 'Tata Tele Business', timestampDelta: '3m 48s apart' }
      },
      {
        id: 'BANK-HDFC',
        label: 'HDFC Bank Connaught\nIFSC: HDFC0000003',
        type: 'bank',
        x: 415,
        y: 310,
        r: 19,
        details: { bank: 'HDFC Bank', branch: 'Connaught Place, New Delhi', ifsc: 'HDFC0000003', linkage: 'Shared signatory profile' }
      },
      {
        id: 'ADDR-CP',
        label: 'Barakhamba Road\nPIN 110001',
        type: 'address',
        x: 275,
        y: 340,
        r: 19,
        details: { city: 'New Delhi', pin: '110001', building: 'Statesman House', proximity: 'Same Commercial Tower' }
      },
      {
        id: 'BID-8901',
        label: 'Solarix Green Energy\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 140,
        y: 120,
        r: 21,
        details: { gstin: '29AAECS4455F1Z2', score: '91/100', role: 'Clean Bidder', quoteINR: 24200000 }
      },
      {
        id: 'BID-8902',
        label: 'Vayu Dynamics Ltd.\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 690,
        y: 340,
        r: 21,
        details: { gstin: '33AABCV8899M1Z9', score: '88/100', role: 'Clean Bidder', quoteINR: 24600000 }
      },
    ],
    edges: [
      { from: 'BID-8903', to: 'DIR-891', label: 'Director', type: 'director', isCollusion: true },
      { from: 'BID-8904', to: 'DIR-891', label: 'Director', type: 'director', isCollusion: true },
      { from: 'BID-8903', to: 'IP-103', label: 'IP Subnet', type: 'ip', isCollusion: true },
      { from: 'BID-8904', to: 'IP-103', label: 'IP Subnet', type: 'ip', isCollusion: true },
      { from: 'BID-8903', to: 'BANK-HDFC', label: 'Bank Branch', type: 'bank', isCollusion: true },
      { from: 'BID-8904', to: 'BANK-HDFC', label: 'Bank Branch', type: 'bank', isCollusion: true },
      { from: 'BID-8903', to: 'ADDR-CP', label: 'Address', type: 'address', isCollusion: true },
      { from: 'BID-8904', to: 'ADDR-CP', label: 'Address', type: 'address', isCollusion: true },
    ],
    implicatedEntities: [
      {
        id: 'BID-8903',
        legalName: 'Apex InfraTech Solutions Ltd.',
        gstin: '07AAACA1122D1Z8',
        address: '5th Floor, Statesman House, Barakhamba Rd, New Delhi - 110001',
        score: 38,
        quoteINR: 23800000,
        severity: 'CRITICAL',
        collusionNote: 'Submissions originated from identical IP 103.24.112.44 within 228 seconds. Common Director DIN: 08912441.'
      },
      {
        id: 'BID-8904',
        legalName: 'GreenVolt Power Systems Pvt. Ltd.',
        gstin: '07AABCG3344K1Z4',
        address: '7th Floor, Statesman House, Barakhamba Rd, New Delhi - 110001',
        score: 31,
        quoteINR: 24900000,
        severity: 'CRITICAL',
        collusionNote: 'Shared bank account branch and corporate director. Quoted near ceiling price to anchor tender bidding corridor.'
      }
    ],
    sharedAttributes: [
      { title: 'Digital Fingerprint (IP)', detail: 'Subnet: 103.24.112.44 (Delta: 3m 48s)', type: 'ip', severity: 'CRITICAL' },
      { title: 'Common Director Board', detail: 'DIN: 08912441 — S. K. Aggarwal', type: 'director', severity: 'CRITICAL' },
      { title: 'Banking Institution IFSC', detail: 'HDFC Bank Connaught Place (HDFC0000003)', type: 'bank', severity: 'HIGH' },
      { title: 'Registered Premises', detail: 'Statesman House, Barakhamba Rd, PIN 110001', type: 'address', severity: 'MEDIUM' }
    ]
  },

  // ─── TENDER 3: Cloud Infrastructure (NIC) ─── CLEAN COMPETITION
  'GEM/2026/B/782310': {
    tenderId: 'GEM/2026/B/782310',
    tenderTitle: 'Cloud Infrastructure & Disaster Recovery Hosting Services',
    department: 'National Informatics Centre (NIC)',
    estimatedValueINR: 120000000,
    category: 'Cloud & Data Center Services',
    closingDate: '2026-10-30',
    totalBidders: 6,
    collusionRisk: 'CLEAN',
    cartelClustersCount: 0,
    banner: {
      severity: 'CLEAN',
      title: 'Competitive Integrity Verified — Zero Collusive Nexus Detected',
      description: 'NetworkX graph analysis across all 6 competing cloud service providers confirmed full statutory independence. Zero shared directors, distinct corporate tax jurisdictions, disparate IP addresses, and authentic autonomous technical quotes.',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 210,
      ry: 140,
      label: 'CLEAN COMPETITIVE TOPOLOGY',
      subLabel: 'Zero Cross-Entity Bipartite Linkages',
      severity: 'CLEAN'
    },
    nodes: [
      {
        id: 'BID-C01',
        label: 'CloudNet India Ltd.\n(Bengaluru Hub)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 230,
        y: 130,
        r: 22,
        details: { gstin: '29AAACC1234A1Z1', score: '94/100', role: 'Autonomous Bidder', quoteINR: 114000000 }
      },
      {
        id: 'BID-C02',
        label: 'DataFortress Tech\n(Hyderabad DC)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 415,
        y: 100,
        r: 22,
        details: { gstin: '36AAACD5678B1Z2', score: '91/100', role: 'Autonomous Bidder', quoteINR: 116500000 }
      },
      {
        id: 'BID-C03',
        label: 'Bharat CloudStack\n(Pune Zone)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 600,
        y: 130,
        r: 22,
        details: { gstin: '27AAACB9012C1Z3', score: '89/100', role: 'Autonomous Bidder', quoteINR: 118000000 }
      },
      {
        id: 'BID-C04',
        label: 'ZenScale Networks\n(Gurugram DC)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 600,
        y: 310,
        r: 22,
        details: { gstin: '06AAACZ3456D1Z4', score: '86/100', role: 'Autonomous Bidder', quoteINR: 112000000 }
      },
      {
        id: 'BID-C05',
        label: 'SecureHost Corp\n(Chennai Hub)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 415,
        y: 340,
        r: 22,
        details: { gstin: '33AAACS7890E1Z5', score: '92/100', role: 'Autonomous Bidder', quoteINR: 115000000 }
      },
      {
        id: 'BID-C06',
        label: 'AlphaByte Infra\n(Noida DC)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 230,
        y: 310,
        r: 22,
        details: { gstin: '09AAACA2345F1Z6', score: '88/100', role: 'Autonomous Bidder', quoteINR: 117200000 }
      },
      {
        id: 'HUB-NIC',
        label: 'NIC GeM Gateway\n(Fair Market Baseline)',
        type: 'director',
        x: 415,
        y: 220,
        r: 26,
        details: { agency: 'National Informatics Centre', protocol: 'GFR 2017 Rule 144(xi) Audit Passed' }
      }
    ],
    edges: [
      { from: 'BID-C01', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
      { from: 'BID-C02', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
      { from: 'BID-C03', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
      { from: 'BID-C04', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
      { from: 'BID-C05', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
      { from: 'BID-C06', to: 'HUB-NIC', label: 'Verified Bid', type: 'director', isCollusion: false },
    ],
    implicatedEntities: [],
    sharedAttributes: [
      { title: 'Board Interlocks', detail: '0 Shared Directors across 6 competitors', type: 'director', severity: 'CLEAN' },
      { title: 'Digital Fingerprints', detail: '6 Disparate Subnets in 5 Indian States', type: 'ip', severity: 'CLEAN' },
      { title: 'Financial Channels', detail: 'Distinct Scheduled Commercial Banks', type: 'bank', severity: 'CLEAN' },
      { title: 'Geographic Diversity', detail: 'Bengaluru, Hyderabad, Pune, Gurugram, Chennai, Noida', type: 'address', severity: 'CLEAN' }
    ]
  },

  // ─── TENDER 4: Medical Diagnostic Scanners (AIIMS) ───
  'GEM/2026/B/654129': {
    tenderId: 'GEM/2026/B/654129',
    tenderTitle: 'Supply & Installation of High-Resolution Medical Diagnostic Scanners',
    department: 'All India Institute of Medical Sciences (AIIMS)',
    estimatedValueINR: 84000000,
    category: 'Advanced Medical Diagnostics',
    closingDate: '2026-11-05',
    totalBidders: 5,
    collusionRisk: 'HIGH',
    cartelClustersCount: 1,
    banner: {
      severity: 'HIGH',
      title: 'Proxy Syndicate Detected — Shared Signatory & Common CA Auditor',
      description: 'MedEquip Global India (BID-M01) and BioScan Diagnostics (BID-M03) share an authorized signatory Dr. Arvind Swaminathan (DIN: 07654321), registered office at Nariman Point (PIN 400021), and identical Statutory Auditor CA membership registration #049218.',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 185,
      ry: 125,
      label: 'SYNDICATE CLUSTER: HIGH RISK',
      subLabel: 'Shared Signatory & Auditor Interlock',
      severity: 'HIGH'
    },
    nodes: [
      {
        id: 'BID-M01',
        label: 'MedEquip Global\nIndia Pvt. Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 280,
        y: 220,
        r: 25,
        details: { gstin: '27AABCM5566P1Z1', score: '42/100', role: 'Syndicate Lead', quoteINR: 81500000 }
      },
      {
        id: 'BID-M03',
        label: 'BioScan Diagnostics\nPvt. Ltd.',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 550,
        y: 220,
        r: 25,
        details: { gstin: '27AABCB7788Q1Z3', score: '39/100', role: 'Syndicate Shadow', quoteINR: 83200000 }
      },
      {
        id: 'DIR-MED',
        label: 'Dr. A. Swaminathan\nDIN: 07654321',
        type: 'director',
        x: 415,
        y: 110,
        r: 19,
        details: { designation: 'Managing Director & Signatory', mcaStatus: 'Overlapping Shareholding (64%)' }
      },
      {
        id: 'ADDR-MUM',
        label: 'Nariman Point\nPIN 400021',
        type: 'address',
        x: 415,
        y: 220,
        r: 19,
        details: { city: 'Mumbai', pin: '400021', building: 'Maker Chambers V', premise: 'Suite 802 vs Suite 804' }
      },
      {
        id: 'CA-FIRM',
        label: 'CA R. K. Singhania\n(Firm #049218)',
        type: 'meta',
        x: 415,
        y: 310,
        r: 19,
        details: { audit: 'ICAI Member #049218', issue: 'Same CA certified net worth certificates for both competitors' }
      },
      {
        id: 'BID-M02',
        label: 'LifeLine Diagnostics\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 140,
        y: 120,
        r: 21,
        details: { gstin: '29AABCL9900R1Z5', score: '88/100', role: 'Clean Bidder', quoteINR: 82000000 }
      },
      {
        id: 'BID-M04',
        label: 'Philips Healthcare\nIndia (Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 690,
        y: 340,
        r: 21,
        details: { gstin: '07AABCP1122S1Z7', score: '96/100', role: 'Clean Bidder', quoteINR: 83500000 }
      },
    ],
    edges: [
      { from: 'BID-M01', to: 'DIR-MED', label: 'Signatory', type: 'director', isCollusion: true },
      { from: 'BID-M03', to: 'DIR-MED', label: 'Signatory', type: 'director', isCollusion: true },
      { from: 'BID-M01', to: 'ADDR-MUM', label: 'Address', type: 'address', isCollusion: true },
      { from: 'BID-M03', to: 'ADDR-MUM', label: 'Address', type: 'address', isCollusion: true },
      { from: 'BID-M01', to: 'CA-FIRM', label: 'Common CA', type: 'meta', isCollusion: true },
      { from: 'BID-M03', to: 'CA-FIRM', label: 'Common CA', type: 'meta', isCollusion: true },
    ],
    implicatedEntities: [
      {
        id: 'BID-M01',
        legalName: 'MedEquip Global India Pvt. Ltd.',
        gstin: '27AABCM5566P1Z1',
        address: 'Maker Chambers V, Nariman Point, Mumbai - 400021',
        score: 42,
        quoteINR: 81500000,
        severity: 'HIGH',
        collusionNote: 'Direct interlocking shareholding and common director with BID-M03.'
      },
      {
        id: 'BID-M03',
        legalName: 'BioScan Diagnostics Pvt. Ltd.',
        gstin: '27AABCB7788Q1Z3',
        address: 'Maker Chambers V, Nariman Point, Mumbai - 400021',
        score: 39,
        quoteINR: 83200000,
        severity: 'HIGH',
        collusionNote: 'Utilized same Chartered Accountant to produce net worth certificates.'
      }
    ],
    sharedAttributes: [
      { title: 'Authorized Signatory', detail: 'Dr. Arvind Swaminathan (DIN: 07654321)', type: 'director', severity: 'CRITICAL' },
      { title: 'Chartered Accountant Auditor', detail: 'M/s Singhania & Co (ICAI #049218)', type: 'meta', severity: 'HIGH' },
      { title: 'Premises Overlap', detail: 'Maker Chambers V, Nariman Point, Mumbai', type: 'address', severity: 'HIGH' }
    ]
  },

  // ─── TENDER 5: Optical Fiber Cable (BharatNet) ───
  'GEM/2026/B/443219': {
    tenderId: 'GEM/2026/B/443219',
    tenderTitle: 'High-Speed Optical Fiber Cable Laying & Trenching Works',
    department: 'Bharat Broadband Network Limited (BharatNet)',
    estimatedValueINR: 345000000,
    category: 'Telecom Infrastructure Works',
    closingDate: '2026-11-12',
    totalBidders: 11,
    collusionRisk: 'CRITICAL',
    cartelClustersCount: 1,
    banner: {
      severity: 'CRITICAL',
      title: 'Tripartite Cartel Ring Detected — Benford Price Clustering Anomaly',
      description: 'FiberTech Infra (BID-F01), NetCable Works (BID-F02), and TelecomGrid Ltd (BID-F03) exhibit severe price-fixing synchronization (prices clustered within 0.18%). They share common registered facilities in Sector 62, Noida and rotated past tender wins.',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 195,
      ry: 135,
      label: 'TRIPARTITE CARTEL RING: CRITICAL',
      subLabel: 'Price Clustering & Win Rotation Pattern',
      severity: 'CRITICAL'
    },
    nodes: [
      {
        id: 'BID-F01',
        label: 'FiberTech Infra Ltd.\n(Quote: ₹34.42 Cr)',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 300,
        y: 160,
        r: 25,
        details: { gstin: '09AABCF1111T1Z1', score: '33/100', role: 'Designated Winner L1', quoteINR: 344200000 }
      },
      {
        id: 'BID-F02',
        label: 'NetCable Works LLP\n(Quote: ₹34.46 Cr)',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 530,
        y: 160,
        r: 25,
        details: { gstin: '09AABCN2222U1Z2', score: '30/100', role: 'Rotating Cover Bid L2', quoteINR: 344600000 }
      },
      {
        id: 'BID-F03',
        label: 'TelecomGrid Ltd.\n(Quote: ₹34.49 Cr)',
        type: 'bidder',
        isCollusionFlagged: true,
        x: 415,
        y: 310,
        r: 25,
        details: { gstin: '09AABCT3333V1Z3', score: '29/100', role: 'Rotating Cover Bid L3', quoteINR: 344900000 }
      },
      {
        id: 'ADDR-NOIDA',
        label: 'Sector 62, Noida\nPIN 201309',
        type: 'address',
        x: 415,
        y: 200,
        r: 19,
        details: { city: 'Noida', pin: '201309', hub: 'C-Block Technology Park' }
      },
      {
        id: 'ROTATION-FLAG',
        label: 'Win Rotation\n(Historical Nexus)',
        type: 'meta',
        x: 300,
        y: 300,
        r: 19,
        details: { pattern: 'Bids rotated across 3 previous DoT regional tenders with 100% mutual exclusions' }
      },
      {
        id: 'BID-F04',
        label: 'OptiSpeed India\n(Independent)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 140,
        y: 120,
        r: 21,
        details: { gstin: '27AABCO4444W1Z4', score: '91/100', role: 'Clean Bidder', quoteINR: 338000000 }
      },
      {
        id: 'BID-F05',
        label: 'RailTel Corp India\n(PSU Competitor)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 690,
        y: 340,
        r: 21,
        details: { gstin: '07AABCR5555X1Z5', score: '97/100', role: 'Independent PSU', quoteINR: 341000000 }
      },
    ],
    edges: [
      { from: 'BID-F01', to: 'ADDR-NOIDA', label: 'Facility', type: 'address', isCollusion: true },
      { from: 'BID-F02', to: 'ADDR-NOIDA', label: 'Facility', type: 'address', isCollusion: true },
      { from: 'BID-F03', to: 'ADDR-NOIDA', label: 'Facility', type: 'address', isCollusion: true },
      { from: 'BID-F01', to: 'ROTATION-FLAG', label: 'Win Rotation', type: 'meta', isCollusion: true },
      { from: 'BID-F02', to: 'ROTATION-FLAG', label: 'Win Rotation', type: 'meta', isCollusion: true },
      { from: 'BID-F03', to: 'ROTATION-FLAG', label: 'Win Rotation', type: 'meta', isCollusion: true },
    ],
    implicatedEntities: [
      {
        id: 'BID-F01',
        legalName: 'FiberTech Infra Ltd.',
        gstin: '09AABCF1111T1Z1',
        address: 'Plot 12, Sector 62, Noida - 201309',
        score: 33,
        quoteINR: 344200000,
        severity: 'CRITICAL',
        collusionNote: 'Designated cartel beneficiary. Quoted within 0.12% variance of sister companies.'
      },
      {
        id: 'BID-F02',
        legalName: 'NetCable Works LLP',
        gstin: '09AABCN2222U1Z2',
        address: 'Plot 14, Sector 62, Noida - 201309',
        score: 30,
        quoteINR: 344600000,
        severity: 'CRITICAL',
        collusionNote: 'Calculated synthetic buffer bid to crowd out genuine competitive bids.'
      },
      {
        id: 'BID-F03',
        legalName: 'TelecomGrid Ltd.',
        gstin: '09AABCT3333V1Z3',
        address: 'Plot 15, Sector 62, Noida - 201309',
        score: 29,
        quoteINR: 344900000,
        severity: 'CRITICAL',
        collusionNote: 'Part of tripartite ring that alternated regional contracts in 2025-2026 cycles.'
      }
    ],
    sharedAttributes: [
      { title: 'Bid Price Clustering Anomaly', detail: 'Prices within 0.18% of tender ceiling', type: 'meta', severity: 'CRITICAL' },
      { title: 'Common Technology Park', detail: 'Plots 12, 14, 15 Sector 62 Noida (PIN 201309)', type: 'address', severity: 'HIGH' },
      { title: 'Historical Win Rotation Matrix', detail: '3 Tenders shared symmetrically across 18 months', type: 'phone', severity: 'CRITICAL' }
    ]
  },

  // ─── TENDER 6: Desalination & Water Treatment (Jal Jeevan) ───
  'GEM/2026/B/332190': {
    tenderId: 'GEM/2026/B/332190',
    tenderTitle: 'Desalination & High-Volume Water Treatment Plant Automation',
    department: 'Department of Drinking Water & Sanitation (Jal Jeevan)',
    estimatedValueINR: 182000000,
    category: 'Water Treatment Infrastructure',
    closingDate: '2026-11-20',
    totalBidders: 3,
    collusionRisk: 'CLEAN',
    cartelClustersCount: 0,
    banner: {
      severity: 'CLEAN',
      title: 'Preliminary Bid Scrutiny Active — Zero Cross-Entity Linkages',
      description: 'Initial document validation and metadata scrutiny of 3 participating consortia indicates independent statutory credentials, non-overlapping management councils, and geographically isolated engineering centers.',
    },
    cluster: {
      cx: 415,
      cy: 220,
      rx: 190,
      ry: 130,
      label: 'INDEPENDENT COMPLIANCE MONITOR',
      subLabel: 'Active Pre-Qualification Evaluation',
      severity: 'CLEAN'
    },
    nodes: [
      {
        id: 'BID-W01',
        label: 'AquaTech Global India\n(Chennai)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 260,
        y: 160,
        r: 23,
        details: { gstin: '33AABCA1234K1Z2', score: '93/100', role: 'Verified Consortia' }
      },
      {
        id: 'BID-W02',
        label: 'HydroPure Projects\n(Kolkata)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 570,
        y: 160,
        r: 23,
        details: { gstin: '19AABCH5678M1Z4', score: '90/100', role: 'Verified Consortia' }
      },
      {
        id: 'BID-W03',
        label: 'Maruti Water Engineering\n(Ahmedabad)',
        type: 'clean_bidder',
        isCollusionFlagged: false,
        x: 415,
        y: 310,
        r: 23,
        details: { gstin: '24AABCM9012P1Z6', score: '87/100', role: 'Verified Consortia' }
      },
      {
        id: 'HUB-JAL',
        label: 'Jal Jeevan Mission\n(National Monitor)',
        type: 'director',
        x: 415,
        y: 210,
        r: 22,
        details: { agency: 'Ministry of Jal Shakti', status: 'Continuous Verification Active' }
      }
    ],
    edges: [
      { from: 'BID-W01', to: 'HUB-JAL', label: 'Preliminary Check', type: 'director', isCollusion: false },
      { from: 'BID-W02', to: 'HUB-JAL', label: 'Preliminary Check', type: 'director', isCollusion: false },
      { from: 'BID-W03', to: 'HUB-JAL', label: 'Preliminary Check', type: 'director', isCollusion: false },
    ],
    implicatedEntities: [],
    sharedAttributes: [
      { title: 'Management Independence', detail: 'Zero common directors across West Bengal, Tamil Nadu & Gujarat', type: 'director', severity: 'CLEAN' },
      { title: 'Tax & Statutory Jurisdictions', detail: '3 Independent state GST registrations', type: 'address', severity: 'CLEAN' }
    ]
  }
};
