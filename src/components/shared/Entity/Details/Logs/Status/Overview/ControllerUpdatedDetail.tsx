import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'stores/EntityStatus/hooks';
import TimestampDetail from './TimestampDetail';
import type { BaseDetailProps } from './types';

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
