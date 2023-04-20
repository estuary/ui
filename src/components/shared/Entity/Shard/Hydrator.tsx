import { useEntityType } from 'context/EntityContext';
import useShardsList from 'hooks/useShardsList';
import { useEffect } from 'react';
import {
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    catalogName: string;
    lastPubId: string;
}

function ShardHydrator({ catalogName, children, lastPubId }: Props) {
    const entityType = useEntityType();

    const { data, error } = useShardsList([
        {
            catalog_name: catalogName,
            id: lastPubId,
            spec_type: entityType,
        },
    ]);

    const setShards = useShardDetail_setShards();
    const setError = useShardDetail_setError();

    useEffect(() => {
        if (data) {
            if (data.error || error) {
                setError(data.error || error);
            }
            if (data.shards.length > 0) {
                setShards(data.shards);
            }
        }
    }, [data, error, setError, setShards]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
