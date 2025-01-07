import { useTheme } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import {
    getAutoDiscoveryIndicatorState,
    isCaptureControllerStatus,
} from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

export default function AutoDiscoveryStatus() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();

    const autoDiscoveryFailure = useEntityStatusStore((state) => {
        const response = state.getSingleResponse(catalogName);

        if (
            !response ||
            !isCaptureControllerStatus(response.controller_status)
        ) {
            return undefined;
        }

        return response.controller_status.auto_discover?.failure;
    });

    const status = getAutoDiscoveryIndicatorState(
        theme.palette.mode,
        autoDiscoveryFailure
    );

    return <StatusIndicator status={status} />;
}
