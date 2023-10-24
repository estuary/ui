import { useTheme } from '@mui/material';
import { useEffect, useMemo } from 'react';
import {
    useShardDetail_setDefaultMessageId,
    useShardDetail_setDefaultStatusColor,
    useShardDetail_setDictionaryHydrated,
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import {
    ShardStatusColor,
    ShardStatusMessageIds,
} from 'stores/ShardDetail/types';
import useShardsList from './useShardsList';

function useShardHydration(
    querySettings: any[],
    defaultMessageId?: ShardStatusMessageIds
) {
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor = useMemo(
        () => (theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9'),
        [theme.palette.mode]
    );

    const { data, error, ...queryResponse } = useShardsList(querySettings);

    const setShards = useShardDetail_setShards();
    const setError = useShardDetail_setError();
    const setDictionaryHydrated = useShardDetail_setDictionaryHydrated();
    const setDefaultMessageId = useShardDetail_setDefaultMessageId();
    const setDefaultStatusColor = useShardDetail_setDefaultStatusColor();

    // Handle setting the defaults
    useEffect(() => {
        if (defaultMessageId) {
            setDefaultMessageId(defaultMessageId);
        }

        setDefaultStatusColor(defaultStatusColor);
    }, [
        defaultMessageId,
        defaultStatusColor,
        setDefaultMessageId,
        setDefaultStatusColor,
    ]);

    // Handle data
    useEffect(() => {
        setError(error ?? null);

        if (data) {
            if (data.shards.length > 0) {
                setShards(data.shards);
            } else {
                setShards([]);
            }
            setDictionaryHydrated(true);
        }
    }, [data, error, setDictionaryHydrated, setError, setShards]);

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
