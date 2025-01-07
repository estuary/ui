import { Skeleton, Typography } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { formatInteger } from 'utils/entityStatus-utils';
import { useShallow } from 'zustand/react/shallow';
import DetailWrapper from './DetailWrapper';
import { NumericDetailProps } from './types';

export default function NumericDetail({
    headerMessageId,
    value,
}: NumericDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.getSingleResponse(catalogName)))
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
