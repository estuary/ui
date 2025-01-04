import { Skeleton, Typography } from '@mui/material';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { formatInteger } from 'utils/entityStatus-utils';
import { useShallow } from 'zustand/react/shallow';
import DetailWrapper from './DetailWrapper';
import { NumericDetailProps } from './types';

export default function NumericDetail({
    headerMessageId,
    value,
}: NumericDetailProps) {
    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.response))
    );

    const content = formatInteger(value);

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Loading={loading ? <Skeleton height={21} width={25} /> : undefined}
        >
            <Typography>{content}</Typography>
        </DetailWrapper>
    );
}
