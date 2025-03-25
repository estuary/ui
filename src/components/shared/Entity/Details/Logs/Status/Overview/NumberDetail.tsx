import type { NumericDetailProps } from './types';
import { Skeleton, Typography } from '@mui/material';
import readable from 'readable-numbers';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import DetailWrapper from './DetailWrapper';

export default function NumericDetail({
    headerMessageId,
    value,
}: NumericDetailProps) {
    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Hydrating={
                hydrating ? <Skeleton height={21} width={25} /> : undefined
            }
        >
            <Typography>{readable(value, 2)}</Typography>
        </DetailWrapper>
    );
}
