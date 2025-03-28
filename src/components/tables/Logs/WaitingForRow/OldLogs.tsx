import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';
import type { WaitingForRowProps } from 'src/components/tables/Logs/types';
import WaitingForRowBase from 'src/components/tables/Logs/WaitingForRow/Base';


function WaitingForOldLogsRow(props: WaitingForRowProps) {
    const olderFinished = useJournalDataLogsStore(
        (state) => state.olderFinished
    );

    return (
        <WaitingForRowBase
            {...props}
            fetchOption="old"
            disabled={olderFinished}
        />
    );
}

export default WaitingForOldLogsRow;
