import { Skeleton, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { useShallow } from 'zustand/react/shallow';
import DetailWrapper from './DetailWrapper';
import { BaseDetailProps } from './types';

export default function TimestampDetail({ headerMessageId }: BaseDetailProps) {
    const intl = useIntl();

    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.response))
    );

    const lastUpdated = useEntityStatusStore(
        (state) => state.response?.controller_updated_at
    );

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Loading={loading ? <Skeleton height={21} width={75} /> : undefined}
        >
            <Typography>
                {intl.formatDate(lastUpdated, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short',
                })}
            </Typography>
        </DetailWrapper>
    );
}
