import { useTheme } from '@mui/material';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import {
    getAutoDiscoveryIndicatorState,
    isCaptureControllerStatus,
} from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

export default function AutoDiscoveryStatus() {
    const theme = useTheme();

    const autoDiscoveryFailure = useEntityStatusStore((state) => {
        if (
            !state.response ||
            !isCaptureControllerStatus(state.response.status)
        ) {
            return undefined;
        }

        return state.response.status.auto_discover?.failure;
    });

    const status = getAutoDiscoveryIndicatorState(
        theme.palette.mode,
        autoDiscoveryFailure
    );

    return <StatusIndicator status={status} />;
}
