import type { BaseStatsProps } from './types';
import StatsCell from './Cell';
import { formatBytes } from './shared';

const Bytes = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatBytes} statType="bytes" {...props} />;
};

export default Bytes;
