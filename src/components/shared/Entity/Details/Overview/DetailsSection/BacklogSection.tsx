import type { MaterializationBacklog } from 'src/hooks/details/shared';

import { Typography } from '@mui/material';

import { formatBytes } from 'src/components/tables/cells/stats/shared';

interface BacklogSectionProps {
    backlog: MaterializationBacklog | null;
    error?: boolean;
}

export function BacklogSection({ backlog, error }: BacklogSectionProps) {
    // A failed request and a window with no binding stats (e.g. a task
    // re-enabled after a long pause that hasn't reported yet) both leave no
    // reading, which isn't the same as caught up
    if (error || !backlog) {
        return <Typography component="div">&mdash;</Typography>;
    }

    // A binding returns 0 for `bytesBehind` once it has nothing left to read, so
    // a task whose bindings all report 0 has caught up
    if (backlog.bytesBehind === 0) {
        return <Typography component="div">current</Typography>;
    }

    return (
        <Typography component="div">
            {formatBytes(backlog.bytesBehind, 2)}
        </Typography>
    );
}
