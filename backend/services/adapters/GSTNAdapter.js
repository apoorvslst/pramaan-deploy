/**
 * PRAMAN - GSTN Portal Mock Adapter
 * Simulates Goods and Services Tax Network API
 */
export class GSTNAdapter {
  static async verify(gstin) {
    // Simulate real-world API network latency (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanGSTIN = (gstin || '').trim().toUpperCase();

    // Specific test scenario triggers for cancelled or suspended vendors
    if (cleanGSTIN.includes('CANCEL') || cleanGSTIN.includes('SUSPEND') || cleanGSTIN.includes('INACTIVE')) {
      return {
        portal: 'GSTN',
        status: 'Cancelled',
        gstin: cleanGSTIN,
        legalName: 'Suspended Enterprises Ltd',
        tradeName: 'Suspended Tech',
        registrationDate: '2019-04-01',
        cancellationDate: '2025-11-30',
        taxpayerType: 'Regular',
        constitutionOfBusiness: 'Private Limited Company',
        lastFiledReturn: 'GSTR-3B (Oct 2025)',
        isCompliant: false,
        queryTimestamp: new Date().toISOString(),
        source: 'GSTN Statutory Gateway'
      };
    }

    return {
      portal: 'GSTN',
      status: 'Active',
      gstin: cleanGSTIN || '07AAAAA0000A1Z5',
      legalName: 'Bharat Solar & Tech Solutions Private Limited',
      tradeName: 'Bharat Solar Tech',
      registrationDate: '2018-06-15',
      constitutionOfBusiness: 'Private Limited Company',
      taxpayerType: 'Regular',
      stateJurisdiction: 'Ward 85, Zone 7, New Delhi',
      centerJurisdiction: 'Range 22, Division 4, Delhi South',
      lastFiledReturn: 'GSTR-3B (August 2026)',
      filingFrequency: 'Monthly',
      isCompliant: true,
      queryTimestamp: new Date().toISOString(),
      source: 'GSTN Statutory Gateway'
    };
  }
}

export default GSTNAdapter;
