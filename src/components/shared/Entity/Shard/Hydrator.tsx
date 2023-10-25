import useShardsList from 'hooks/useShardsList';
import { useEffect } from 'react';
import {
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    catalogName: string;
}

function ShardHydrator({ catalogName, children }: Props) {
    const { data, error } = useShardsList([catalogName]);

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
