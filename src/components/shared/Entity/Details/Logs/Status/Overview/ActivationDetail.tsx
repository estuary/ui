import { Skeleton, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    useEntityStatusStore_lastActivated,
    useEntityStatusStore_singleResponse,
} from 'src/stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { getDataPlaneActivationStatus } from 'src/utils/entityStatus-utils';
import DetailWrapper from 'src/components/shared/Entity/Details/Logs/Status/Overview/DetailWrapper';
import type { BaseDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

export default function ActivationDetail({ headerMessageId }: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const hydrating = useEntityStatusStore((state) => !state.hydrated);
    const lastActivated = useEntityStatusStore_lastActivated(catalogName);
    const lastBuildId =
        useEntityStatusStore_singleResponse(catalogName)?.last_build_id;

    const contentMessageId = getDataPlaneActivationStatus(
        lastActivated,
        lastBuildId
    );

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Hydrating={
                hydrating ? <Skeleton height={21} width={75} /> : undefined
            }
        >
            <Typography>
                {intl.formatMessage({ id: contentMessageId })}
            </Typography>
        </DetailWrapper>
    );
}
