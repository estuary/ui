import { useTheme } from '@mui/material';

import StatusIndicator from 'src/components/shared/Entity/Details/Logs/Status/Overview/StatusIndicator';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_autoDiscoverFailure } from 'src/stores/EntityStatus/hooks';
import { getAutoDiscoveryIndicatorState } from 'src/utils/entityStatus-utils';

export default function AutoDiscoveryStatus() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();

    const autoDiscoveryFailure =
        useEntityStatusStore_autoDiscoverFailure(catalogName);

    const status = getAutoDiscoveryIndicatorState(
        theme.palette.mode,
        autoDiscoveryFailure
    );

    return <StatusIndicator status={status} />;
}
