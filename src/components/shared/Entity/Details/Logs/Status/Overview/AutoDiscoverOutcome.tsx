import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { isCaptureControllerStatus } from 'utils/entityStatus-utils';
import AutoDiscoverChanges from './AutoDiscoverChanges';
import TimestampDetail from './TimestampDetail';

export default function AutoDiscoverOutcome() {
    const failure = useEntityStatusStore((state) => {
        if (
            !state.response ||
            !isCaptureControllerStatus(state.response.status)
        ) {
            return undefined;
        }

        return state.response.status.auto_discover?.failure;
    });

    const lastSuccess = useEntityStatusStore((state) => {
        if (
            !state.response ||
            !isCaptureControllerStatus(state.response.status)
        ) {
            return undefined;
        }

        return state.response.status.auto_discover?.last_success;
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
