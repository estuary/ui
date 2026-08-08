import type { BacklogSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Typography } from '@mui/material';

import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';

export function BacklogSection({ entityName }: BacklogSectionProps) {
    const { backlog, error } = useMaterializationBacklog(entityName);

    // A failed request leaves `backlog` null, the same shape as a caught-up
    // task, so check the error first to avoid reporting a stats failure as
    // "current".
    if (error) {
        return <Typography component="div">&mdash;</Typography>;
    }

    // A binding omits `bytesBehind` once it has nothing left to read, so a task
    // whose bindings report nothing has caught up. The card holds its skeleton
    // until this has loaded, so an empty result here is an answer, not a wait.
    if (!backlog || backlog.bytesBehind === 0) {
        return <Typography component="div">current</Typography>;
    }

    return (
        <Typography component="div">
            {formatBytes(backlog.bytesBehind)}
        </Typography>
    );
}
