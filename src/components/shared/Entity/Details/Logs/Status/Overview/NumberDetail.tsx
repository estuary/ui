import { Skeleton, Typography } from '@mui/material';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { formatInteger } from 'utils/entityStatus-utils';
import DetailWrapper from './DetailWrapper';
import { NumericDetailProps } from './types';

export default function NumericDetail({
    headerMessageId,
    value,
}: NumericDetailProps) {
    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    const content = formatInteger(value);

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Hydrating={
                hydrating ? <Skeleton height={21} width={25} /> : undefined
            }
        >
            <Typography>{content}</Typography>
        </DetailWrapper>
    );
}
