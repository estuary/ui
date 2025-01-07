import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import TimestampDetail from './TimestampDetail';
import { BaseDetailProps } from './types';

export default function ControllerUpdatedDetail({
    headerMessageId,
}: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const lastUpdated = useEntityStatusStore(
        (state) => state.getSingleResponse(catalogName)?.controller_updated_at
    );

    return (
        <TimestampDetail headerMessageId={headerMessageId} time={lastUpdated} />
    );
}
