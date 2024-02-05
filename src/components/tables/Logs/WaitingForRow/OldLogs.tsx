import { useJournalDataLogsStore_olderFinished } from 'stores/JournalData/Logs/hooks';
import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

function WaitingForOldLogsRow(props: WaitingForRowProps) {
    const olderFinished = useJournalDataLogsStore_olderFinished();

    return (
        <WaitingForRowBase
            {...props}
            fetchOption="old"
            disabled={olderFinished}
        />
    );
}

export default WaitingForOldLogsRow;
