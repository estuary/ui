import { useTheme } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'stores/EntityStatus/hooks';
import { getConnectorStatusIndicatorState } from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

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
