import { WaitingForRowProps } from './types';
import WaitingForRowBase from './Base';

function WaitingForOldLogsRow(props: WaitingForRowProps) {
    return (
        <WaitingForRowBase
            {...props}
            messageKey="ops.logsTable.waitingForOldLogs"
        />
    );
}

export default WaitingForOldLogsRow;
