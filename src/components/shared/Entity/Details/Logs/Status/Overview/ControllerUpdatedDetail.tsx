import TimestampDetail from './TimestampDetail';
import { BaseDetailProps } from './types';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';

export default function ControllerUpdatedDetail({
    headerMessageId,
}: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const lastUpdated =
        useEntityStatusStore_singleResponse(catalogName)?.controller_updated_at;

    return (
        <TimestampDetail headerMessageId={headerMessageId} time={lastUpdated} />
    );
}
