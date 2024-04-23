import { useJournalDataLogsStore } from 'stores/JournalData/Logs/Store';
import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

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
