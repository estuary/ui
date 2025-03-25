import type { BaseStatsProps } from './types';
import StatsCell from './Cell';
import { formatDocs } from './shared';

const Docs = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatDocs} statType="docs" {...props} />;
};

export default Docs;
