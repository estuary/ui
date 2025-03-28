import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

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
