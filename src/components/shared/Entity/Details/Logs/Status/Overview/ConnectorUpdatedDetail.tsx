import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore_singleResponse } from 'stores/EntityStatus/hooks';
import TimestampDetail from './TimestampDetail';
import { BaseDetailProps } from './types';

export default function ConnectorUpdatedDetail({
    headerMessageId,
}: BaseDetailProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const lastUpdated =
        useEntityStatusStore_singleResponse(catalogName)?.connector_status?.ts;

    return (
        <TimestampDetail headerMessageId={headerMessageId} time={lastUpdated} />
    );
}
