import { Skeleton, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { useShallow } from 'zustand/react/shallow';
import DetailWrapper from './DetailWrapper';
import { TimestampDetailProps } from './types';

export default function TimestampDetail({
    headerMessageId,
    time,
}: TimestampDetailProps) {
    const intl = useIntl();

    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.response))
    );

    const content = time
        ? intl.formatDate(time, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short',
          })
        : intl.formatMessage({ id: 'common.unknown' });

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Loading={loading ? <Skeleton height={21} width={75} /> : undefined}
        >
            <Typography>{content}</Typography>
        </DetailWrapper>
    );
}
