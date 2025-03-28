import type { BaseStatsProps } from 'src/components/tables/cells/stats/types';

import StatsCell from 'src/components/tables/cells/stats/Cell';
import { formatBytes } from 'src/components/tables/cells/stats/shared';

const Bytes = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatBytes} statType="bytes" {...props} />;
};

export default Bytes;
