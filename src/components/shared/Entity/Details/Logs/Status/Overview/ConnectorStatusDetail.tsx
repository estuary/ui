import type { BaseDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Skeleton, Typography } from '@mui/material';

import DetailWrapper from 'src/components/shared/Entity/Details/Logs/Status/Overview/DetailWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

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
