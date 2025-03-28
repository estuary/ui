import { WaitingForRowProps } from '../types';
import WaitingForRowBase from './Base';

import { DEFAULT_POLLING } from 'src/context/SWR';

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
