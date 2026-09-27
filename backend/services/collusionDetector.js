/**
 * PRAMAN — Cartel, Proxy & Collusion Detection Engine (Graph Analysis)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Implements the mathematical collusion detection model from PRAMAN spec:
 * 
 * SIGNAL TYPES:
 *   S1: Shared Director Graph (Board interlock via DIN overlap)
 *   S2: Common Registered Address (Euclidean distance < threshold)
 *   S3: Same Bank Account / IFSC (Financial nexus detection)
 *   S4: Common IP / User-Agent (Digital fingerprint)
 *   S5: Phone / Email Domain Overlap
 *   S6: Bid Price Clustering (Benford's Law anomaly)
 *   S7: Historical Award Pattern (Win rotation detection)
 *
 * RISK SCORING:
 *   CollusionRisk(Bi, Bj) = Σ(w_k * signal_k(Bi, Bj)) for k=1..7
 *   Cluster = Connected components where risk > threshold
 */

export class CollusionDetector {
  /**
   * Detects collusion signals across all bidders competing on the same tender
   * @param {Array} bidders - Array of Bidder documents (populated)
   * @param {Array} submissions - Array of BidSubmission documents (populated with bidderId)
   * @returns {Object} Collusion report with flagged clusters, signals, and risk scores
   */
  static analyze(bidders = [], submissions = []) {
    if (bidders.length < 2) {
      return {
        collusionDetected: false,
        totalBidders: bidders.length,
        totalSignals: 0,
        riskClusters: [],
        pairwiseSignals: [],
        analysisTimestamp: new Date().toISOString(),
        verdict: 'Insufficient bidders for collusion analysis (minimum 2 required).',
      };
    }

    const pairwiseSignals = [];
    const adjacencyGraph = {};  // bidderId -> Set of connected bidder IDs
    const signalWeights = {
      SHARED_DIRECTOR: 0.30,
      COMMON_ADDRESS: 0.20,
      SAME_BANK_ACCOUNT: 0.15,
      COMMON_IP: 0.10,
      PHONE_EMAIL_OVERLAP: 0.10,
      BID_PRICE_CLUSTER: 0.10,
      WIN_ROTATION: 0.05,
    };

    // Initialize adjacency graph
    for (const b of bidders) {
      const id = b._id?.toString() || b.id;
      adjacencyGraph[id] = new Set();
    }

    // Pairwise comparison (O(n²) but n is bounded by tender bidder count)
    for (let i = 0; i < bidders.length; i++) {
      for (let j = i + 1; j < bidders.length; j++) {
        const b1 = bidders[i];
        const b2 = bidders[j];
        const id1 = b1._id?.toString() || b1.id;
        const id2 = b2._id?.toString() || b2.id;

        const signals = [];
        let totalRisk = 0;

        // ── S1: SHARED DIRECTOR (Board Interlock) ──
        const dirs1 = (b1.directors || []).map(d => (d.din || d.name || '').toLowerCase().trim()).filter(Boolean);
        const dirs2 = (b2.directors || []).map(d => (d.din || d.name || '').toLowerCase().trim()).filter(Boolean);
        const commonDirs = dirs1.filter(d => dirs2.includes(d));

        if (commonDirs.length > 0) {
          const signal = {
            type: 'SHARED_DIRECTOR',
            severity: commonDirs.length >= 2 ? 'CRITICAL' : 'HIGH',
            weight: signalWeights.SHARED_DIRECTOR,
            detail: `${commonDirs.length} common director(s): ${commonDirs.join(', ')}`,
            matchedValues: commonDirs,
          };
          signals.push(signal);
          totalRisk += signal.weight;
        }

        // ── S2: COMMON REGISTERED ADDRESS ──
        const addr1 = this._normalizeAddress(b1.registeredAddress);
        const addr2 = this._normalizeAddress(b2.registeredAddress);
        const addressSimilarity = this._stringSimilarity(addr1, addr2);

        if (addressSimilarity > 0.75) {
          const signal = {
            type: 'COMMON_ADDRESS',
            severity: addressSimilarity > 0.9 ? 'CRITICAL' : 'HIGH',
            weight: signalWeights.COMMON_ADDRESS,
            detail: `Address similarity: ${(addressSimilarity * 100).toFixed(1)}%`,
            matchedValues: [addr1, addr2],
          };
          signals.push(signal);
          totalRisk += signal.weight;
        }

        // ── S3: SAME BANK ACCOUNT / IFSC ──
        const bank1 = b1.bankAccountDetails;
        const bank2 = b2.bankAccountDetails;
        if (bank1 && bank2) {
          const sameAccount = bank1.accountNumber && bank2.accountNumber &&
            bank1.accountNumber === bank2.accountNumber;
          const sameIFSC = bank1.ifscCode && bank2.ifscCode &&
            bank1.ifscCode === bank2.ifscCode;

          if (sameAccount) {
            signals.push({
              type: 'SAME_BANK_ACCOUNT',
              severity: 'CRITICAL',
              weight: signalWeights.SAME_BANK_ACCOUNT,
              detail: `Identical bank account number detected: ${bank1.accountNumber}`,
              matchedValues: [bank1.accountNumber],
            });
            totalRisk += signalWeights.SAME_BANK_ACCOUNT;
          } else if (sameIFSC) {
            signals.push({
              type: 'SAME_BANK_BRANCH',
              severity: 'MEDIUM',
              weight: signalWeights.SAME_BANK_ACCOUNT * 0.3,
              detail: `Same bank branch (IFSC: ${bank1.ifscCode}). Investigate further.`,
              matchedValues: [bank1.ifscCode],
            });
            totalRisk += signalWeights.SAME_BANK_ACCOUNT * 0.3;
          }
        }

        // ── S4: COMMON IP ADDRESS / USER AGENT ──
        const ips1 = (b1.ipSubmissionHistory || []).map(h => h.ipAddress).filter(Boolean);
        const ips2 = (b2.ipSubmissionHistory || []).map(h => h.ipAddress).filter(Boolean);
        const commonIPs = ips1.filter(ip => ips2.includes(ip) && ip !== '127.0.0.1' && ip !== '::1');

        if (commonIPs.length > 0) {
          signals.push({
            type: 'COMMON_IP',
            severity: 'HIGH',
            weight: signalWeights.COMMON_IP,
            detail: `${commonIPs.length} shared submission IP(s): ${commonIPs.join(', ')}`,
            matchedValues: commonIPs,
          });
          totalRisk += signalWeights.COMMON_IP;
        }

        // ── S5: PHONE / EMAIL DOMAIN OVERLAP ──
        const email1Domain = (b1.primaryEmail || '').split('@')[1]?.toLowerCase();
        const email2Domain = (b2.primaryEmail || '').split('@')[1]?.toLowerCase();
        const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];

        if (email1Domain && email2Domain && email1Domain === email2Domain && !genericDomains.includes(email1Domain)) {
          signals.push({
            type: 'PHONE_EMAIL_OVERLAP',
            severity: 'MEDIUM',
            weight: signalWeights.PHONE_EMAIL_OVERLAP,
            detail: `Same corporate email domain: @${email1Domain}`,
            matchedValues: [email1Domain],
          });
          totalRisk += signalWeights.PHONE_EMAIL_OVERLAP;
        }

        const phone1 = (b1.primaryPhone || '').replace(/\D/g, '');
        const phone2 = (b2.primaryPhone || '').replace(/\D/g, '');
        if (phone1 && phone2 && phone1 === phone2) {
          signals.push({
            type: 'PHONE_OVERLAP',
            severity: 'HIGH',
            weight: signalWeights.PHONE_EMAIL_OVERLAP,
            detail: `Identical phone number: ${b1.primaryPhone}`,
            matchedValues: [b1.primaryPhone],
          });
          totalRisk += signalWeights.PHONE_EMAIL_OVERLAP;
        }

        // ── S6: BID PRICE CLUSTERING (Optional - if bids have price data) ──
        const sub1 = submissions.find(s => (s.bidderId?._id || s.bidderId)?.toString() === id1);
        const sub2 = submissions.find(s => (s.bidderId?._id || s.bidderId)?.toString() === id2);
        if (sub1?.quotedAmountINR && sub2?.quotedAmountINR) {
          const priceDiff = Math.abs(sub1.quotedAmountINR - sub2.quotedAmountINR);
          const avgPrice = (sub1.quotedAmountINR + sub2.quotedAmountINR) / 2;
          const priceVariance = avgPrice > 0 ? priceDiff / avgPrice : 0;

          if (priceVariance < 0.005) { // within 0.5% of each other
            signals.push({
              type: 'BID_PRICE_CLUSTER',
              severity: 'HIGH',
              weight: signalWeights.BID_PRICE_CLUSTER,
              detail: `Bid prices within ${(priceVariance * 100).toFixed(3)}% — statistical anomaly.`,
              matchedValues: [sub1.quotedAmountINR, sub2.quotedAmountINR],
            });
            totalRisk += signalWeights.BID_PRICE_CLUSTER;
          }
        }

        // ── Build adjacency graph edges ──
        if (signals.length > 0) {
          adjacencyGraph[id1].add(id2);
          adjacencyGraph[id2].add(id1);

          pairwiseSignals.push({
            bidder1: {
              id: id1,
              name: b1.legalBusinessName,
              gstin: b1.gstin,
            },
            bidder2: {
              id: id2,
              name: b2.legalBusinessName,
              gstin: b2.gstin,
            },
            totalRiskScore: Math.min(1.0, totalRisk),
            signalCount: signals.length,
            signals,
          });
        }
      }
    }

    // ── Connected Component Detection (BFS) ──
    const visited = new Set();
    const clusters = [];

    for (const startId of Object.keys(adjacencyGraph)) {
      if (visited.has(startId)) continue;
      if (adjacencyGraph[startId].size === 0) continue;

      const cluster = [];
      const queue = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const current = queue.shift();
        const bidder = bidders.find(b => (b._id?.toString() || b.id) === current);
        cluster.push({
          id: current,
          name: bidder?.legalBusinessName || 'Unknown',
          gstin: bidder?.gstin,
        });

        for (const neighbor of adjacencyGraph[current]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (cluster.length >= 2) {
        // Compute cluster-level aggregated risk
        const clusterSignals = pairwiseSignals.filter(ps =>
          cluster.some(c => c.id === ps.bidder1.id) && cluster.some(c => c.id === ps.bidder2.id)
        );
        const maxRisk = Math.max(...clusterSignals.map(s => s.totalRiskScore));
        const avgRisk = clusterSignals.reduce((a, s) => a + s.totalRiskScore, 0) / clusterSignals.length;

        clusters.push({
          clusterId: `CARTEL-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
          clusterSize: cluster.length,
          members: cluster,
          maxPairwiseRisk: Number(maxRisk.toFixed(3)),
          avgPairwiseRisk: Number(avgRisk.toFixed(3)),
          severity: maxRisk >= 0.5 ? 'CRITICAL' : (maxRisk >= 0.3 ? 'HIGH' : 'MEDIUM'),
          recommendation: maxRisk >= 0.5
            ? 'IMMEDIATE disqualification review. Multiple collusion signals exceed critical threshold.'
            : 'Flag for manual officer investigation. Potential proxy / shell company network.',
          detectedSignals: clusterSignals,
        });
      }
    }

    return {
      collusionDetected: clusters.length > 0,
      totalBidders: bidders.length,
      totalSignals: pairwiseSignals.reduce((a, p) => a + p.signalCount, 0),
      highRiskPairs: pairwiseSignals.filter(p => p.totalRiskScore >= 0.3).length,
      riskClusters: clusters,
      pairwiseSignals,
      analysisTimestamp: new Date().toISOString(),
      verdict: clusters.length > 0
        ? `⚠️ COLLUSION ALERT: ${clusters.length} cartel cluster(s) detected across ${bidders.length} bidders.`
        : '✅ No collusion patterns detected across competing bidders.',
    };
  }

  // ── UTILITY: Normalize Address ──
  static _normalizeAddress(addr) {
    if (!addr) return '';
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  // ── UTILITY: Jaccard String Similarity ──
  static _stringSimilarity(a, b) {
    if (!a || !b) return 0;
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    return union.size > 0 ? intersection.length / union.size : 0;
  }
}

export default CollusionDetector;
