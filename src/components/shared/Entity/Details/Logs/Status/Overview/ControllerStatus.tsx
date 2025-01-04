import { useTheme } from '@mui/material';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { getControllerStatusIndicatorState } from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

export default function ControllerStatus() {
    const theme = useTheme();

    const controllerError = useEntityStatusStore(
        (state) => state.response?.controller_error
    );
    const controllerNextRun = useEntityStatusStore(
        (state) => state.response?.controller_next_run
    );

    const status = getControllerStatusIndicatorState(
        theme.palette.mode,
        controllerError,
        controllerNextRun
    );

    return <StatusIndicator status={status} />;
}
