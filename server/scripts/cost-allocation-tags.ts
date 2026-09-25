import {
  CostExplorerClient,
  ListCostAllocationTagsCommand,
  UpdateCostAllocationTagsStatusCommand,
} from '@aws-sdk/client-cost-explorer';
import { TAG_KEYS } from '../infra/lib/constants.js';

/**
 * Makes the app's tag keys (Project, Stage) usable in Cost Explorer and billing reports.
 *
 * CloudFormation has no resource for this: activation is an account-wide billing setting, so the
 * backend deploy does it through the Cost Explorer API. It is idempotent and never fails a deploy:
 *   - a key billing has not seen yet (it takes up to a day after the first tagged resources exist)
 *     is activated on a later deploy
 *   - in an AWS Organizations member account only the management account can activate tags
 */
export async function activateCostAllocationTags(label: string): Promise<void> {
  const keys = Object.values(TAG_KEYS);
  const costExplorer = new CostExplorerClient({ region: 'us-east-1' }); // Cost Explorer is global

  try {
    const { CostAllocationTags = [] } = await costExplorer.send(
      new ListCostAllocationTagsCommand({ TagKeys: keys, Type: 'UserDefined' }),
    );
    const known = new Map(CostAllocationTags.map((t) => [t.TagKey, t.Status]));
    const inactive = keys.filter((key) => known.get(key) === 'Inactive');
    const unseen = keys.filter((key) => !known.has(key));

    if (inactive.length > 0) {
      const { Errors = [] } = await costExplorer.send(
        new UpdateCostAllocationTagsStatusCommand({
          CostAllocationTagsStatus: inactive.map((TagKey) => ({ TagKey, Status: 'Active' })),
        }),
      );
      for (const e of Errors)
        console.warn(`[${label}] could not activate ${e.TagKey ?? '?'}: ${e.Message ?? ''}`);
    }

    const active = keys.filter((key) => known.get(key) === 'Active' || inactive.includes(key));
    console.warn(
      `[${label}] cost allocation tags active: ${active.join(', ') || 'none'}` +
        (unseen.length > 0
          ? `; not in billing yet, retried next deploy: ${unseen.join(', ')}`
          : ''),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[${label}] skipped cost allocation tag activation: ${message}`);
  }
}
