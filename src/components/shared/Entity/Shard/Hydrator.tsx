import type { BaseComponentProps } from 'src/types';

import useDetailsEntityTaskTypes from 'src/hooks/details/useDetailsEntityTaskTypes';
import useShardHydration from 'src/hooks/shards/useShardHydration';

interface Props extends BaseComponentProps {
    catalogName: string;
}

function ShardHydrator({ catalogName, children }: Props) {
    const taskTypes = useDetailsEntityTaskTypes();

    useShardHydration(taskTypes.length === 0 ? [] : [catalogName], {
        // The details shard rendering always handles showing the error if nothing
        //  is fetched and we do not need to handle it
        errorOnAllFailed: false,
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
