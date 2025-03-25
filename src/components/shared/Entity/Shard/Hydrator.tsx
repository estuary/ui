import type { BaseComponentProps } from 'types';
import useShardHydration from 'hooks/shards/useShardHydration';
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
