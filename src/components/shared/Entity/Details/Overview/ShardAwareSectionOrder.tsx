import type { ReactNode } from 'react';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import useShardStatusNeedsAttention from 'src/hooks/details/useShardStatusNeedsAttention';

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
 * page. People rely on shard status to flag an unhealthy task, so when it
 * needs attention, this card jumps above everything else instead of sitting
 * below it — "anything but running" shouldn't be scrollable-past.
 *
 * Reads shard status itself (`taskName`/`taskTypes` in, not a precomputed
 * boolean) so a status tick only re-renders this small component rather
 * than `Overview` and everything it builds — the usage chart, the details
 * rail, bindings, task endpoints — none of which this decision touches.
 *
 * Split out from `Overview/index.tsx` so Storybook can show the reorder on
 * its own — the page itself pulls in the usage chart, the details rail, and
 * live binding data, none of which this behaviour depends on.
 */
function ShardAwareSectionOrder({
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

export default ShardAwareSectionOrder;
