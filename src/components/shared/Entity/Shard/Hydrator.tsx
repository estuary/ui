import { useTheme } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useMemo } from 'react';
import {
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { ShardStatusColor } from 'stores/ShardDetail/types';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    lastPubId: string;
    catalogName: string;
}

function ShardHydrator({ catalogName, children, lastPubId }: Props) {
    const entityType = useEntityType();
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor = useMemo(
        () => (theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9'),
        [theme.palette.mode]
    );

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
                setShards(data.shards, defaultStatusColor);
            } else {
                setShards([], defaultStatusColor);
            }
        }
    }, [data, defaultStatusColor, error, setError, setShards]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
