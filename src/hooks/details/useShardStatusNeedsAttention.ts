import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { errorMain, warningMain } from 'src/context/Theme';
import { useShardDetail_readDictionary } from 'src/stores/ShardDetail/hooks';

/**
 * Whether a task's shard status is anything but running.
 *
 * Compared against the colour rather than `shardsHaveErrors` /
 * `shardsHaveWarnings`: those only populate from the FAILED branch's
 * inferred-schema check (see `getEverythingForDictionary` in
 * `stores/ShardDetail/Store.ts`), so an IDLE, STANDBY or BACKFILL shard would
 * leave both flags false and never surface here.
 */
export function useShardStatusNeedsAttention(
    taskName: string,
    taskTypes: ShardEntityTypes[]
): boolean {
    const { compositeColor } = useShardDetail_readDictionary(
        taskName,
        taskTypes
    );

    return compositeColor === errorMain || compositeColor === warningMain;
}
