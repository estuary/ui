import type { WaitingForRowProps } from '../types';
import { DEFAULT_POLLING } from 'context/SWR';
import WaitingForRowBase from './Base';

function WaitingForNewLogsRow(props: WaitingForRowProps) {
    return (
        <WaitingForRowBase
            {...props}
            fetchOption="new"
            disabled={false}
            interval={DEFAULT_POLLING}
        />
    );
}

export default WaitingForNewLogsRow;
