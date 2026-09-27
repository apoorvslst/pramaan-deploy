/**
 * PRAMAN - MCA21 Portal Mock Adapter
 * Simulates Ministry of Corporate Affairs ROC Company and Director Verification API
 */
export class MCAAdapter {
  static async verify(identifier) {
    // Simulate real-world API network latency (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanId = (identifier || '').trim().toUpperCase();

    if (cleanId.includes('STRIKE') || cleanId.includes('DORMANT')) {
      return {
        portal: 'MCA21',
        status: 'Strike-Off / Inactive',
        cin: 'U40106DL2010PTC123456',
        companyName: 'Defunct Solar Works Pvt Ltd',
        companyCategory: 'Company limited by Shares',
        classOfCompany: 'Private',
        dateOfIncorporation: '2010-01-10',
        directors: [],
        queryTimestamp: new Date().toISOString(),
        source: 'MCA21 Corporate Registry'
      };
    }

    return {
      portal: 'MCA21',
      status: 'Active',
      cin: 'U40106DL2018PTC335819',
      companyName: 'Bharat Solar & Tech Solutions Private Limited',
      companyCategory: 'Company limited by Shares',
      classOfCompany: 'Private',
      dateOfIncorporation: '2018-06-15',
      registeredROC: 'RoC-Delhi',
      authorizedCapitalINR: 10000000,
      paidUpCapitalINR: 5000000,
      directors: [
        { din: '08154219', name: 'Rajendra Mehta', designation: 'Managing Director', appointmentDate: '2018-06-15' },
        { din: '08154220', name: 'Sunita Mehta', designation: 'Director', appointmentDate: '2018-06-15' }
      ],
      chargesRegistered: [],
      annualReturnsLastFiledYear: 2025,
      balanceSheetLastFiledYear: 2025,
      queryTimestamp: new Date().toISOString(),
      source: 'MCA21 Corporate Registry'
    };
  }
}

export default MCAAdapter;
