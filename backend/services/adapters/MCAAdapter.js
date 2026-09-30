/**
 * PRAMAN - MCA21 Portal Statutory Adapter
 * Simulates Ministry of Corporate Affairs ROC Company and Director Verification API
 */
export class MCAAdapter {
  static async verify(identifier, declaredName = '') {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const cleanId = (identifier || '').trim().toUpperCase();

    if (cleanId.includes('STRIKE') || cleanId.includes('DORMANT')) {
      return {
        portal: 'MCA21',
        status: 'Strike-Off / Inactive',
        cin: `U40106RJ2010PTC${cleanId.slice(-6) || '123456'}`,
        companyName: declaredName || 'Defunct Enterprises Pvt Ltd',
        companyCategory: 'Company limited by Shares',
        classOfCompany: 'Private',
        dateOfIncorporation: '2010-01-10',
        directors: [],
        queryTimestamp: new Date().toISOString(),
        source: 'MCA21 Corporate Registry'
      };
    }

    const companyName = declaredName || (cleanId.length === 10 ? `ENTERPRISE (${cleanId})` : 'Active Registered Entity');

    return {
      portal: 'MCA21',
      status: 'Active',
      cin: `U40106RJ2018PTC${cleanId.slice(-6) || '335819'}`,
      companyName,
      companyCategory: 'Company limited by Shares',
      classOfCompany: 'Private',
      dateOfIncorporation: '2018-06-15',
      registeredROC: 'RoC-Jaipur',
      authorizedCapitalINR: 10000000,
      paidUpCapitalINR: 5000000,
      directors: [
        { din: '08154219', name: 'Authorized Director', designation: 'Managing Director', appointmentDate: '2018-06-15' }
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
