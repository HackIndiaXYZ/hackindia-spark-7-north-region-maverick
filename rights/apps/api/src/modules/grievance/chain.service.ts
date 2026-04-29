/**
 * ChainService — fires a non-blocking record to the standalone chain service
 * (apps/chain on port 4002) every time a grievance is created.
 *
 * This is intentionally fire-and-forget: a failure here must NEVER break
 * the primary grievance-creation flow. All errors are logged only.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);
  private readonly chainUrl: string;

  constructor() {
    const port = process.env.CHAIN_PORT || '4002';
    this.chainUrl = `http://localhost:${port}`;
  }

  /**
   * Record a grievance on the blockchain layer.
   * Safe to call with `void` — never throws.
   */
  async record(grievance: {
    id: string;
    rawText: string;
    category: string;
    urgency: string;
    statute: string;
    section: string;
    pin: string;
    locality?: string | null;
    isAnonymous: boolean;
    officer: { name: string; designation: string };
    user: { fullName?: string | null };
  }): Promise<void> {
    try {
      const body = {
        // Required by chain service
        pin:         grievance.pin,
        title:       `${grievance.category.toUpperCase()} — ${grievance.urgency} priority`,
        description: grievance.rawText,

        // Optional enrichment fields
        fullName:          grievance.isAnonymous ? undefined : (grievance.user?.fullName || undefined),
        location:          grievance.locality || undefined,
        tags:              [grievance.category, grievance.urgency].join(','),
        rightsRegulations: `${grievance.statute} — ${grievance.section}`,

        // Metadata for cross-reference: postgres ID stored in chain so it's retrievable
        postgresId:  grievance.id,
        officer:     grievance.officer?.name,
        designation: grievance.officer?.designation,
      };

      const res = await fetch(`${this.chainUrl}/api/grievance-chain`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  AbortSignal.timeout(8_000), // 8 s — chain must respond quickly
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        this.logger.warn(
          `Chain record failed — HTTP ${res.status}: ${text.slice(0, 200)}`,
        );
        return;
      }

      const json = await res.json() as Record<string, unknown>;
      this.logger.log(
        `Chain record OK — grievanceId: ${grievance.id} ` +
        `→ blockHash: ${String(json.blockchainHash ?? 'N/A').slice(0, 12)}… ` +
        `storageType: ${json.storageType}`,
      );
    } catch (err) {
      // Chain service may be offline — this is non-fatal
      this.logger.warn(
        `Chain service unreachable — grievance ${grievance.id} stored in Postgres only. ` +
        `Error: ${(err as Error)?.message ?? 'unknown'}`,
      );
    }
  }
}
