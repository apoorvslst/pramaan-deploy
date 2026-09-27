import crypto from 'crypto';
import { AuditLedger } from '../models/AuditLedger.js';

export class AuditLedgerService {
  /**
   * Computes SHA-256 hash of arbitrary data
   */
  static hash(data) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Appends an immutable block to the cryptographic audit ledger
   */
  static async recordEvent({ actionType, actor, entityId, payloadData }) {
    try {
      const lastBlock = await AuditLedger.findOne().sort({ blockIndex: -1 }).lean();

      const blockIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;
      const previousHash = lastBlock 
        ? lastBlock.currentHash 
        : '0000000000000000000000000000000000000000000000000000000000000000';
      
      const timestamp = new Date();
      const payloadHash = this.hash(payloadData);

      const headerString = `${blockIndex}-${previousHash}-${timestamp.toISOString()}-${actionType}-${payloadHash}`;
      const currentHash = this.hash(headerString);

      const newBlock = new AuditLedger({
        blockIndex,
        previousHash,
        timestamp,
        actionType,
        actor: {
          userId: actor?.userId || null,
          name: actor?.name || 'System / Officer',
          role: actor?.role || 'SYSTEM_AI',
          ipAddress: actor?.ipAddress || '127.0.0.1'
        },
        entityId: entityId ? entityId.toString() : 'GLOBAL',
        payloadData,
        payloadHash,
        currentHash
      });

      await newBlock.save();
      return newBlock;
    } catch (error) {
      console.error('[AuditLedger] Error appending block:', error);
      throw new Error(`Audit ledger recording failed: ${error.message}`);
    }
  }

  /**
   * Verifies the cryptographic integrity of the entire audit chain or a specific entity chain
   */
  static async verifyLedgerIntegrity(entityId = null) {
    const query = entityId ? { entityId: entityId.toString() } : {};
    const blocks = await AuditLedger.find(query).sort({ blockIndex: 1 }).lean();

    if (blocks.length === 0) {
      return { isValid: true, totalBlocks: 0, message: 'Chain is empty, no blocks to verify.' };
    }

    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];

      if (i === 0) {
        if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
          return {
            isValid: false,
            brokenAtIndex: 0,
            blockId: current._id,
            reason: 'Corrupt Genesis Block: previousHash is not 64 zeroes'
          };
        }
      } else {
        const previous = blocks[i - 1];
        if (current.previousHash !== previous.currentHash) {
          return {
            isValid: false,
            brokenAtIndex: current.blockIndex,
            blockId: current._id,
            reason: `Broken chain link between block #${previous.blockIndex} and #${current.blockIndex}`
          };
        }
      }

      const calculatedPayloadHash = this.hash(current.payloadData);
      if (calculatedPayloadHash !== current.payloadHash) {
        return {
          isValid: false,
          brokenAtIndex: current.blockIndex,
          blockId: current._id,
          reason: `Payload data tampered at block #${current.blockIndex}`
        };
      }

      const headerString = `${current.blockIndex}-${current.previousHash}-${new Date(current.timestamp).toISOString()}-${current.actionType}-${current.payloadHash}`;
      const recalculatedCurrentHash = this.hash(headerString);
      if (recalculatedCurrentHash !== current.currentHash) {
        return {
          isValid: false,
          brokenAtIndex: current.blockIndex,
          blockId: current._id,
          reason: `Block header hash mismatch at block #${current.blockIndex}`
        };
      }
    }

    return { 
      isValid: true, 
      totalBlocks: blocks.length, 
      merkleRoot: blocks[blocks.length - 1].currentHash,
      message: 'Cryptographic chain verification passed 100%. Zero tampering detected.' 
    };
  }
}

export default AuditLedgerService;
