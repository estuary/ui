import type { TimeLagSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Typography } from '@mui/material';

import { Duration } from 'luxon';

import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';
import { toHumanDuration } from 'src/services/luxon';

// One unit is enough to convey a lag at a glance — "1 day" rather than trailing
// hours and minutes that will be stale by the time they are read.
const formatLag = (seconds: number) =>
    toHumanDuration(Duration.fromObject({ seconds }), { maxUnits: 1 });

export function TimeLagSection({ entityName }: TimeLagSectionProps) {
    const { timeLag } = useMaterializationBacklog(entityName);

    if (!timeLag) {
        return <Typography component="div">&mdash;</Typography>;
    }

    // A zero lag means every binding sits at or past its collection's frontier,
    // caught up in time. Shown as "current" to match the data backlog row.
    if (timeLag.seconds === 0) {
        return <Typography component="div">current</Typography>;
    }

    return (
        <Typography component="div">{formatLag(timeLag.seconds)}</Typography>
    );
}
