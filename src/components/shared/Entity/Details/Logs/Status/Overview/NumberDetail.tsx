import { Skeleton, Typography } from '@mui/material';

import DetailWrapper from './DetailWrapper';
import { NumericDetailProps } from './types';
import readable from 'readable-numbers';

import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

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
