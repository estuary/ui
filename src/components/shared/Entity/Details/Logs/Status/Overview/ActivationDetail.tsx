import { Skeleton, Typography } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import {
    getDataPlaneActivationStatus,
    isEntityControllerStatus,
} from 'utils/entityStatus-utils';
import DetailWrapper from './DetailWrapper';
import { BaseDetailProps } from './types';

export default function ActivationDetail({ headerMessageId }: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    const lastActivated = useEntityStatusStore((state) => {
        const response = state.getSingleResponse(catalogName);

        if (
            !response?.controller_status ||
            !isEntityControllerStatus(response.controller_status)
        ) {
            return undefined;
        }

        return response.controller_status.activation?.last_activated;
    });

    const lastBuildId = useEntityStatusStore(
        (state) => state.getSingleResponse(catalogName)?.last_build_id
    );

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
