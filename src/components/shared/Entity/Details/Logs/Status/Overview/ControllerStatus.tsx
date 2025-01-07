import { useTheme } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { getControllerStatusIndicatorState } from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

export default function ControllerStatus() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();

    const controllerError = useEntityStatusStore(
        (state) => state.getSingleResponse(catalogName)?.controller_error
    );
    const controllerNextRun = useEntityStatusStore(
        (state) => state.getSingleResponse(catalogName)?.controller_next_run
    );

    const status = getControllerStatusIndicatorState(
        theme.palette.mode,
        controllerError,
        controllerNextRun
    );

    return <StatusIndicator status={status} />;
}
