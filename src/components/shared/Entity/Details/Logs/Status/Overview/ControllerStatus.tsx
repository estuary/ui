import { useTheme } from '@mui/material';

import StatusIndicator from 'src/components/shared/Entity/Details/Logs/Status/Overview/StatusIndicator';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { getControllerStatusIndicatorState } from 'src/utils/entityStatus-utils';

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
