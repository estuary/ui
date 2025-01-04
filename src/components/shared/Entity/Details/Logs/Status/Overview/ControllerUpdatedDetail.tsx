import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import TimestampDetail from './TimestampDetail';
import { BaseDetailProps } from './types';

export default function ControllerUpdatedDetail({
    headerMessageId,
}: BaseDetailProps) {
    const lastUpdated = useEntityStatusStore(
        (state) => state.response?.controller_updated_at
    );

    return (
        <TimestampDetail headerMessageId={headerMessageId} time={lastUpdated} />
    );
}
