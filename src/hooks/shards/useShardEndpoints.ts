import { useMemo } from 'react';
import { useShardDetail_readDictionary } from 'stores/ShardDetail/hooks';
import { ShardEntityTypes } from 'stores/ShardDetail/types';
import { getURL, hasLength } from 'utils/misc-utils';

export const useShardEndpoints = (
    taskName: string,
    taskTypes: ShardEntityTypes[],
    reactorAddress: string | undefined
) => {
    const dictionaryVal = useShardDetail_readDictionary(taskName, taskTypes);

    const gatewayHostname = useMemo<string | null>(() => {
        if (typeof reactorAddress === 'string' && hasLength(reactorAddress)) {
            const url = getURL(reactorAddress, 'ShardEndpoint : error');

            return url?.host ?? null;
        }

        return null;
    }, [reactorAddress]);

    const endpoints = useMemo(() => {
        const response: any[] = [];

        dictionaryVal.allShards.forEach((shardVal) => {
            if (shardVal.shardEndpoints) {
                const shardEndpoints = Object.values(shardVal.shardEndpoints);
                if (shardEndpoints.length > 0) {
                    response.push(...shardEndpoints);
                }
            }
        });
        return response;
    }, [dictionaryVal.allShards]);

    return useMemo(
        () => ({
            endpoints,
            gatewayHostname,
        }),
        [endpoints, gatewayHostname]
    );
};
