import { useTheme } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'stores/EntityStatus/hooks';
import { getControllerStatusIndicatorState } from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

export default function ControllerStatus() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();

    const controllerError =
        useEntityStatusStore_singleResponse(catalogName)?.controller_error;

    const controllerNextRun =
        useEntityStatusStore_singleResponse(catalogName)?.controller_next_run;

    const status = getControllerStatusIndicatorState(
        theme.palette.mode,
        controllerError,
        controllerNextRun
    );

    return <StatusIndicator status={status} />;
}
