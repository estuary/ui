import { useEffect } from 'react';

import { BaseComponentProps } from 'types';

import { useEntityType } from 'context/EntityContext';

import useShardsList from 'hooks/useShardsList';

import {
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';

interface Props extends BaseComponentProps {
    lastPubId: string;
    catalogName: string;
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
        // Set the error or default back to null
        setError(error ?? null);

        // Try to set the data returned
        if (data) {
            if (data.shards.length > 0) {
                setShards(data.shards);
            } else {
                setShards([]);
            }
        }
    }, [data, error, setError, setShards]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
