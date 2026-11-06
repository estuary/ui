import type { TimestampDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Skeleton, Typography } from '@mui/material';

import { DetailWrapper } from 'src/components/shared/Entity/Details/Logs/Status/Overview/DetailWrapper';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

// Formats in the browser's language, the locale the app's IntlProvider used.
const formatTimestamp = (time: string) => {
    const date = new Date(time);
    const locale = navigator.language || 'en-US';

    return `${date.toLocaleString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    })}, ${date.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })}`;
};

export default function TimestampDetail({
    header,
    time,
}: TimestampDetailProps) {
    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    return (
        <DetailWrapper
            header={header}
            Hydrating={
                hydrating ? <Skeleton height={21} width={75} /> : undefined
            }
        >
            <Typography>{time ? formatTimestamp(time) : '--'}</Typography>
        </DetailWrapper>
    );
}
