import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    useEntityStatusStore_autoDiscoverFailure,
    useEntityStatusStore_autoDiscoverLastSuccess,
} from 'src/stores/EntityStatus/hooks';
import AutoDiscoverChanges from 'src/components/shared/Entity/Details/Logs/Status/Overview/AutoDiscoverChanges';
import TimestampDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/TimestampDetail';


export default function AutoDiscoverOutcome() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const failure = useEntityStatusStore_autoDiscoverFailure(catalogName);
    const lastSuccess =
        useEntityStatusStore_autoDiscoverLastSuccess(catalogName);

    if (failure) {
        return (
            <>
                <AutoDiscoverChanges
                    added={failure.last_outcome.added}
                    modified={failure.last_outcome.modified}
                    removed={failure.last_outcome.removed}
                />

                <TimestampDetail
                    headerMessageId="details.ops.status.overview.autoDiscovery.subheaderLastFailure"
                    time={failure.last_outcome.ts}
                />
            </>
        );
    }

    return (
        <>
            <AutoDiscoverChanges
                added={lastSuccess?.added}
                modified={lastSuccess?.modified}
                removed={lastSuccess?.removed}
            />

            <TimestampDetail
                headerMessageId="details.ops.status.overview.autoDiscovery.subheaderLastSuccess"
                time={lastSuccess?.ts}
            />
        </>
    );
}
