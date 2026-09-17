import type { ReactNode } from 'react';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useShardStatusNeedsAttention } from 'src/hooks/details/useShardStatusNeedsAttention';

interface Props {
    shardInformation: ReactNode;
    taskName: string;
    // The rest of the Overview tab below the chart and rail — bindings,
    // task endpoints, whatever else. Passed through as-is; this component
    // only decides where the shard status card sits relative to it.
    taskSections: ReactNode;
    taskTypes: ShardEntityTypes[];
}

/**
 * Orders the Overview tab's Shard Information card against the rest of the
 * page: when shard status needs attention the card jumps above everything else.
 *
 * Reads shard status itself rather than taking a precomputed boolean, so a
 * status tick re-renders only this component rather than `Overview` and the
 * usage chart, details rail and bindings it builds.
 */
export function ShardAwareSectionOrder({
    shardInformation,
    taskName,
    taskSections,
    taskTypes,
}: Props) {
    const needsAttention = useShardStatusNeedsAttention(taskName, taskTypes);

    return (
        <>
            {needsAttention ? shardInformation : null}
            {taskSections}
            {needsAttention ? null : shardInformation}
        </>
    );
}
