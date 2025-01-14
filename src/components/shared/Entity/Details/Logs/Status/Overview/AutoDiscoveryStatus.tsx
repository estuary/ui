import { useTheme } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_autoDiscoverFailure } from 'stores/EntityStatus/hooks';
import { getAutoDiscoveryIndicatorState } from 'utils/entityStatus-utils';
import StatusIndicator from './StatusIndicator';

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
