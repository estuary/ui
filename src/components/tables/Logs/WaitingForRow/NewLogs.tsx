import WaitingForRowBase from './Base';
import { WaitingForRowProps } from './types';

function WaitingForNewLogsRow(props: WaitingForRowProps) {
    return (
        <WaitingForRowBase
            {...props}
            messageKey="ops.logsTable.waitingForNewLogs"
        />
    );
}

export default WaitingForNewLogsRow;
