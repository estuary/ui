import { useTheme } from '@mui/material';

import StatusIndicator from 'src/components/shared/Entity/Details/Logs/Status/Overview/StatusIndicator';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { getConnectorStatusIndicatorState } from 'src/utils/entityStatus-utils';

export default function ConnectorStatus() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();

    const connectorStatus =
        useEntityStatusStore_singleResponse(catalogName)?.connector_status;

    const status = getConnectorStatusIndicatorState(
        theme.palette.mode,
        connectorStatus
    );

    return <StatusIndicator status={status} />;
}
