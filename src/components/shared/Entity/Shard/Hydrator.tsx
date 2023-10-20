import { useEntityType } from 'context/EntityContext';
import useShardHydration from 'hooks/shards/useShardHydration';

import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    lastPubId: string;
    catalogName: string;
}

function ShardHydrator({ catalogName, children, lastPubId }: Props) {
    const entityType = useEntityType();

    useShardHydration([
        {
            catalog_name: catalogName,
            id: lastPubId,
            spec_type: entityType,
        },
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
