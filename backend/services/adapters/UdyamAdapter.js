/**
 * PRAMAN - Udyam / MSME Portal Mock Adapter
 * Simulates Ministry of MSME Udyam Registration Verification API
 */
export class UdyamAdapter {
  static async verify(udyamNumber) {
    // Simulate real-world API network latency (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanUdyam = (udyamNumber || '').trim().toUpperCase();

    if (cleanUdyam.includes('EXPIRED') || cleanUdyam.includes('INVALID')) {
      return {
        portal: 'UDYAM',
        status: 'Expired',
        udyamRegistrationNumber: cleanUdyam,
        enterpriseName: 'Inactive Enterprise',
        enterpriseType: 'Not Found',
        isMSME: false,
        eligibleForPPOExemption: false,
        validity: 'Expired',
        queryTimestamp: new Date().toISOString(),
        source: 'MSME Udyam Portal'
      };
    }

    return {
      portal: 'UDYAM',
      status: 'Active',
      udyamRegistrationNumber: cleanUdyam || 'UDYAM-DL-03-0049281',
      enterpriseName: 'Bharat Solar & Tech Solutions Private Limited',
      enterpriseType: 'Micro', // Micro | Small | Medium
      majorActivity: 'Manufacturing',
      nicCode: '27104 - Manufacture of electric power distribution & control apparatus',
      investmentInPlantMachineryINR: 4200000,
      annualTurnoverINR: 16500000,
      dateOfIncorporation: '2018-06-15',
      dateOfUdyamRegistration: '2020-09-12',
      isMSME: true,
      eligibleForPPOExemption: true,
      queryTimestamp: new Date().toISOString(),
      source: 'MSME Udyam Portal'
    };
  }
}

export default UdyamAdapter;
