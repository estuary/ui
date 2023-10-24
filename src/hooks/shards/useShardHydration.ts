import { useTheme } from '@mui/material';
import { useEffect, useMemo } from 'react';
import {
    useShardDetail_setDictionaryHydrated,
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { ShardStatusColor } from 'stores/ShardDetail/types';
import useShardsList from './useShardsList';

function useShardHydration(querySettings: any[]) {
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor = useMemo(
        () => (theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9'),
        [theme.palette.mode]
    );

    const { data, error, ...queryResponse } = useShardsList(querySettings);

    const setShards = useShardDetail_setShards();
    const setError = useShardDetail_setError();
    const setDictionaryHydrated = useShardDetail_setDictionaryHydrated();

    useEffect(() => {
        // Reset the state
        setError(error ?? null);

        // Try to set the data returned
        if (data) {
            if (data.shards.length > 0) {
                setShards(data.shards, defaultStatusColor);
            } else {
                setShards([], defaultStatusColor);
            }

            setDictionaryHydrated(true);
        }
    }, [
        data,
        defaultStatusColor,
        error,
        setDictionaryHydrated,
        setError,
        setShards,
    ]);

    return useMemo(
        () => ({
            data,
            error,
            ...queryResponse,
        }),
        [data, error, queryResponse]
    );
}

export default useShardHydration;
