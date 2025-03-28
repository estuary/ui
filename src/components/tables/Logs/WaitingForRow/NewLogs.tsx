import type { WaitingForRowProps } from 'src/components/tables/Logs/types';

import WaitingForRowBase from 'src/components/tables/Logs/WaitingForRow/Base';
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
