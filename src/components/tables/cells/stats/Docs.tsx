import StatsCell from 'src/components/tables/cells/stats/Cell';
import { formatDocs } from 'src/components/tables/cells/stats/shared';
import type { BaseStatsProps } from 'src/components/tables/cells/stats/types';

const Docs = (props: BaseStatsProps) => {
    return <StatsCell formatter={formatDocs} statType="docs" {...props} />;
};

export default Docs;
