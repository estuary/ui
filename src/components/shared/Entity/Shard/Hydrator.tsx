
import useShardHydration from 'src/hooks/shards/useShardHydration';
import type { BaseComponentProps } from 'src/types';
import useDetailsEntityTaskTypes from 'src/components/shared/Entity/Details/useDetailsEntityTaskTypes';

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
