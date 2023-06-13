import DataByHourGraph from 'components/graphs/DataByHourGraph';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { hasLength } from 'utils/misc-utils';

interface Props {
    catalogName: string;
}

function Stats({ catalogName }: Props) {
    const { isValidating, stats, error } = useDetailsStats(catalogName);

    if (isValidating) {
        return <GraphLoadingState />;
    }

    if (error) {
        return <Error error={error} />;
    }

    if (!hasLength(stats)) {
        return <EmptyGraphState />;
    }

    console.log('stats', stats);

    return <DataByHourGraph />;
}

export default Stats;
