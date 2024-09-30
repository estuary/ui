import { useMemo } from 'react';
import { logRocketConsole } from 'services/shared';
import { useShardDetail_readDictionary } from 'stores/ShardDetail/hooks';
import { ShardEntityTypes } from 'stores/ShardDetail/types';
import { hasLength } from 'utils/misc-utils';

export const useShardEndpoints = (
    taskName: string,
    taskTypes: ShardEntityTypes[],
    reactorAddress: string | undefined
) => {
    const dictionaryVal = useShardDetail_readDictionary(taskName, taskTypes);

    const gatewayHostname = useMemo(() => {
        if (typeof reactorAddress === 'string' && hasLength(reactorAddress)) {
            try {
                const url = new URL(reactorAddress);

                return url.host;
            } catch (error: unknown) {
                logRocketConsole('ShardEndpoint : error', { error });
            }
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
