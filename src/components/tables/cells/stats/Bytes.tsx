import StatsCell from 'src/components/tables/cells/stats/Cell';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import type { BaseStatsProps } from 'src/components/tables/cells/stats/types';

const Bytes = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatBytes} statType="bytes" {...props} />;
};

export default Bytes;
