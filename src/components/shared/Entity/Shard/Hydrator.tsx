import useShardHydration from 'src/hooks/shards/useShardHydration';
import { BaseComponentProps } from 'src/types';
import useDetailsEntityTaskTypes from '../Details/useDetailsEntityTaskTypes';

interface Props extends BaseComponentProps {
    catalogName: string;
}

function ShardHydrator({ catalogName, children }: Props) {
    const taskTypes = useDetailsEntityTaskTypes();

    useShardHydration(taskTypes.length === 0 ? [] : [catalogName]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
