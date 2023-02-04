import { useEntityType } from 'context/EntityContext';
import useShardsList from 'hooks/useShardsList';
import { useEffect } from 'react';
import { useShardDetail_setShards } from 'stores/ShardDetail/hooks';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    lastPubId: string;
    catalogName: string;
}

function ShardHydrator({ catalogName, children, lastPubId }: Props) {
    const entityType = useEntityType();

    const { data: shardsData } = useShardsList([
        {
            catalog_name: catalogName,
            id: lastPubId,
            spec_type: entityType,
        },
    ]);

    const setShards = useShardDetail_setShards();

    useEffect(() => {
        if (shardsData && shardsData.shards.length > 0) {
            setShards(shardsData.shards);
        }
    }, [setShards, shardsData]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
