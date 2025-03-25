import StatsCell from './Cell';
import { formatBytes } from './shared';
import type { BaseStatsProps } from './types';

const Bytes = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatBytes} statType="bytes" {...props} />;
};

export default Bytes;
