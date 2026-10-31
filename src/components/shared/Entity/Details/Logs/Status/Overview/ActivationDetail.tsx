import type { BaseDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';
import type {
    ActivationStatus,
    EntityStatusResponse,
} from 'src/types/controlPlane';

import { Skeleton, Typography } from '@mui/material';

import { DetailWrapper } from 'src/components/shared/Entity/Details/Logs/Status/Overview/DetailWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    useEntityStatusStore_lastActivated,
    useEntityStatusStore_singleResponse,
} from 'src/stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

// Whether the data plane has activated the latest build.
const getActivationStatus = (
    lastActivated: ActivationStatus['last_activated'],
    lastBuildId?: EntityStatusResponse['last_build_id']
) => {
    if (!lastActivated || !lastBuildId) {
        return 'Unknown';
    }

    return lastActivated === lastBuildId ? 'Up-to-date' : 'Pending';
};

export default function ActivationDetail({ header }: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const hydrating = useEntityStatusStore((state) => !state.hydrated);
    const lastActivated = useEntityStatusStore_lastActivated(catalogName);
    const lastBuildId =
        useEntityStatusStore_singleResponse(catalogName)?.last_build_id;

    return (
        <DetailWrapper
            header={header}
            Hydrating={
                hydrating ? <Skeleton height={21} width={75} /> : undefined
            }
        >
            <Typography>
                {getActivationStatus(lastActivated, lastBuildId)}
            </Typography>
        </DetailWrapper>
    );
}
