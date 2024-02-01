import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

function WaitingForNewLogsRow(props: WaitingForRowProps) {
    return <WaitingForRowBase {...props} fetchOption="new" />;
}

export default WaitingForNewLogsRow;
