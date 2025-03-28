import { Skeleton, Typography } from '@mui/material';

import readable from 'readable-numbers';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import DetailWrapper from 'src/components/shared/Entity/Details/Logs/Status/Overview/DetailWrapper';
import type { NumericDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';


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
