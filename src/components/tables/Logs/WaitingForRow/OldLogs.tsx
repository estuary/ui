import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

function WaitingForOldLogsRow(props: WaitingForRowProps) {
    return <WaitingForRowBase {...props} fetchOption="old" />;
}

export default WaitingForOldLogsRow;
