import { Skeleton, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import DetailWrapper from './DetailWrapper';
import { TimestampDetailProps } from './types';

export default function TimestampDetail({
    headerMessageId,
    time,
}: TimestampDetailProps) {
    const intl = useIntl();

    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    const content = time
        ? `${intl.formatDate(time, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short',
          })}, ${intl.formatDate(time, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })}`
        : '--';

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Hydrating={
                hydrating ? <Skeleton height={21} width={75} /> : undefined
            }
        >
            <Typography>{content}</Typography>
        </DetailWrapper>
    );
}
