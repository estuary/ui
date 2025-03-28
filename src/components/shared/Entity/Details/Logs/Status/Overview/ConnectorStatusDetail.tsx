import { Skeleton, Typography } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import DetailWrapper from './DetailWrapper';
import { BaseDetailProps } from './types';

export default function ConnectorStatusDetail({
    headerMessageId,
}: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    const lastStatus =
        useEntityStatusStore_singleResponse(catalogName)?.connector_status
            ?.message;

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Hydrating={
                hydrating ? <Skeleton height={21} width={75} /> : undefined
            }
        >
            <Typography> {lastStatus ?? '--'} </Typography>
        </DetailWrapper>
    );
}
