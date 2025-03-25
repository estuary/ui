import StatsCell from './Cell';
import { formatDocs } from './shared';
import type { BaseStatsProps } from './types';

const Docs = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatDocs} statType="docs" {...props} />;
};

export default Docs;
