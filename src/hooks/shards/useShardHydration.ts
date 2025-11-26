import type { ShardStatusMessageIds } from 'src/stores/ShardDetail/types';

import { useEffect, useMemo } from 'react';

import { useIntl } from 'react-intl';

import useShardsList from 'src/hooks/shards/useShardsList';
import useShardStatusDefaultColor from 'src/hooks/shards/useShardStatusDefaultColor';
import {
    useShardDetail_setDefaultMessageId,
    useShardDetail_setDefaultStatusColor,
    useShardDetail_setDictionaryHydrated,
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'src/stores/ShardDetail/hooks';

interface UseShardHydrationSettings {
    defaultMessageId?: ShardStatusMessageIds;
    errorOnAllFailed?: boolean;
}

function useShardHydration(
    querySettings: any[],
    settings?: UseShardHydrationSettings
) {
    const intl = useIntl();

    const defaultStatusColor = useShardStatusDefaultColor();

    const { data, error, ...queryResponse } = useShardsList(querySettings);

    const setShards = useShardDetail_setShards();
    const setShardsError = useShardDetail_setError();
    const setDictionaryHydrated = useShardDetail_setDictionaryHydrated();
    const setDefaultMessageId = useShardDetail_setDefaultMessageId();
    const setDefaultStatusColor = useShardDetail_setDefaultStatusColor();

    // Handle setting the defaults
    useEffect(() => {
        if (settings?.defaultMessageId) {
            setDefaultMessageId(settings?.defaultMessageId);
        }

        setDefaultStatusColor(defaultStatusColor);
    }, [
        defaultStatusColor,
        setDefaultMessageId,
        setDefaultStatusColor,
        settings?.defaultMessageId,
    ]);

    // Handle data
    useEffect(() => {
        if (settings?.errorOnAllFailed && data?.allCallsFailed) {
            setShardsError({
                ...error,
                message: intl.formatMessage({
                    id: 'detailsPanel.shardDetails.fetchError.allFailed',
                }),
            });
            return;
        }

        if (data) {
            if (data.shards.length > 0) {
                setShards(data.shards);
            } else {
                setShards([]);
            }

            setShardsError(null);
            setDictionaryHydrated(true);
        } else {
            // Only show error if there is no data
            setShardsError(error ?? null);
        }
    }, [
        data,
        error,
        setDictionaryHydrated,
        setShardsError,
        setShards,
        intl,
        settings?.errorOnAllFailed,
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
