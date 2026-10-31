import type { BaseDetailProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import TimestampDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/TimestampDetail';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';

export default function ControllerUpdatedDetail({ header }: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const lastUpdated =
        useEntityStatusStore_singleResponse(catalogName)?.controller_updated_at;

    return <TimestampDetail header={header} time={lastUpdated} />;
}
