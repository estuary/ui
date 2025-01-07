import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { isCaptureControllerStatus } from 'utils/entityStatus-utils';
import AutoDiscoverChanges from './AutoDiscoverChanges';
import TimestampDetail from './TimestampDetail';

export default function AutoDiscoverOutcome() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const failure = useEntityStatusStore((state) => {
        const response = state.getSingleResponse(catalogName);

        if (
            !response ||
            !isCaptureControllerStatus(response.controller_status)
        ) {
            return undefined;
        }

        return response.controller_status.auto_discover?.failure;
    });

    const lastSuccess = useEntityStatusStore((state) => {
        const response = state.getSingleResponse(catalogName);

        if (
            !response ||
            !isCaptureControllerStatus(response.controller_status)
        ) {
            return undefined;
        }

        return response.controller_status.auto_discover?.last_success;
    });

    if (failure) {
        return (
            <>
                <AutoDiscoverChanges
                    added={failure.last_outcome.added}
                    modified={failure.last_outcome.modified}
                    removed={failure.last_outcome.removed}
                />

                <TimestampDetail
                    headerMessageId="details.ops.status.overview.autoDiscovery.subheaderFirstFailure"
                    time={failure.first_ts}
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
