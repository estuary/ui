import { Skeleton, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import {
    getDataPlaneActivationStatus,
    isEntityControllerStatus,
} from 'utils/entityStatus-utils';
import { useShallow } from 'zustand/react/shallow';
import DetailWrapper from './DetailWrapper';
import { BaseDetailProps } from './types';

export default function ActivationDetail({ headerMessageId }: BaseDetailProps) {
    const intl = useIntl();

    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.response))
    );

    const lastActivated = useEntityStatusStore((state) => {
        if (
            !state.response?.status ||
            !isEntityControllerStatus(state.response.status)
        ) {
            return undefined;
        }

        return state.response.status.activation?.last_activated;
    });

    const lastBuildId = useEntityStatusStore(
        (state) => state.response?.last_build_id
    );

    const contentMessageId = getDataPlaneActivationStatus(
        lastActivated,
        lastBuildId
    );

    return (
        <DetailWrapper
            headerMessageId={headerMessageId}
            Loading={loading ? <Skeleton height={21} width={75} /> : undefined}
        >
            <Typography>
                {intl.formatMessage({ id: contentMessageId })}
            </Typography>
        </DetailWrapper>
    );
}
