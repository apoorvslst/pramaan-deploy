/**
 * PRAMAN - GeM & CPPP Consolidated Debarment / Blacklist Adapter
 * Simulates checking against central debarred and banned vendor registries
 */
export class DebarmentAdapter {
  static async verify(panOrGstin) {
    // Simulate real-world API network latency (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanQuery = (panOrGstin || '').trim().toUpperCase();

    // Trigger debarred simulation if query has 'BAN', 'DEBAR', or specific test identifier
    const isDebarred = cleanQuery.includes('BAN') || cleanQuery.includes('DEBAR') || cleanQuery.includes('BLACKLIST');

    if (isDebarred) {
      return {
        portal: 'GEM_DEBAR',
        isDebarred: true,
        panOrGstin: cleanQuery,
        orderNumber: 'GEM/DEBAR/2024/7719',
        banningMinistry: 'Ministry of Railways / GeM Vigilance',
        orderDate: '2024-05-10',
        debarredTill: '2027-05-09',
        reason: 'Submission of falsified test reports and integrity pact violation under GFR Rule 151',
        status: 'CURRENTLY_BLACKLISTED',
        queryTimestamp: new Date().toISOString(),
        source: 'GeM Central Debarment Repository'
      };
    }

    return {
      portal: 'GEM_DEBAR',
      isDebarred: false,
      panOrGstin: cleanQuery,
      status: 'CLEAN_RECORD',
      message: 'No active blacklisting, debarment, or holiday listing orders found on GeM or CPPP.',
      queryTimestamp: new Date().toISOString(),
      source: 'GeM Central Debarment Repository'
    };
  }
}

export default DebarmentAdapter;
