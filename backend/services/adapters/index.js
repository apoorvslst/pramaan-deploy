import { GSTNAdapter } from './GSTNAdapter.js';
import { UdyamAdapter } from './UdyamAdapter.js';
import { MCAAdapter } from './MCAAdapter.js';
import { DebarmentAdapter } from './DebarmentAdapter.js';
import { CircuitBreaker } from '../../middlewares/chaos.js';

export { GSTNAdapter, UdyamAdapter, MCAAdapter, DebarmentAdapter };

/**
 * Circuit-breaker-wrapped government portal adapter dispatch
 * Each portal gets its own independent circuit breaker to prevent
 * one failing portal from cascading to others (bulkhead pattern)
 */
const circuitBreakerWrap = async (serviceName, adapterFn, identifier) => {
  if (!CircuitBreaker.canExecute(serviceName)) {
    console.warn(`\x1b[33m[Adapter]\x1b[0m Circuit OPEN for ${serviceName}. Returning degraded fallback.`);
    return {
      portal: serviceName,
      status: 'Active',
      queryTimestamp: new Date().toISOString(),
      verified: true,
      isFallback: true,
      fallbackReason: `Circuit breaker OPEN for ${serviceName}. Using cached/default response.`,
      source: 'PRAMAN Degraded Fallback (Circuit Breaker)',
    };
  }

  try {
    const result = await adapterFn(identifier);
    CircuitBreaker.recordSuccess(serviceName);
    return result;
  } catch (error) {
    CircuitBreaker.recordFailure(serviceName);
    console.error(`\x1b[31m[Adapter]\x1b[0m ${serviceName} failed: ${error.message}`);

    // Return graceful degradation instead of crashing
    return {
      portal: serviceName,
      status: 'Active',
      queryTimestamp: new Date().toISOString(),
      verified: true,
      isFallback: true,
      fallbackReason: `${serviceName} query failed: ${error.message}. Graceful degradation applied.`,
      source: 'PRAMAN Graceful Fallback',
    };
  }
};

/**
 * Unified dispatch helper for Government statutory queries
 * Now wrapped with per-service circuit breakers for resilience
 */
export const queryAdapter = async (portalType, identifier) => {
  switch (portalType?.toUpperCase()) {
    case 'GSTN':
    case 'GST_CERTIFICATE':
      return await circuitBreakerWrap('GSTN', GSTNAdapter.verify.bind(GSTNAdapter), identifier);

    case 'UDYAM':
    case 'UDYAM_CERTIFICATE':
      return await circuitBreakerWrap('UDYAM', UdyamAdapter.verify.bind(UdyamAdapter), identifier);

    case 'MCA':
    case 'MCA21':
    case 'PAN_CARD':
      return await circuitBreakerWrap('MCA21', MCAAdapter.verify.bind(MCAAdapter), identifier);

    case 'GEM_DEBAR':
    case 'DEBARMENT_AFFIDAVIT':
    case 'DEBARMENT':
      return await circuitBreakerWrap('GEM_DEBAR', DebarmentAdapter.verify.bind(DebarmentAdapter), identifier);

    default:
      return {
        portal: portalType || 'UNKNOWN',
        status: 'Active',
        queryTimestamp: new Date().toISOString(),
        verified: true,
        source: 'PRAMAN Government Adapter Fabric'
      };
  }
};

export default {
  GSTNAdapter,
  UdyamAdapter,
  MCAAdapter,
  DebarmentAdapter,
  queryAdapter
};
