import useScopedGatewayAuthToken from 'hooks/useScopedGatewayAuthToken';
import { useMemo } from 'react';
import { useShardDetail_readDictionary } from 'stores/ShardDetail/hooks';
import { Entity } from 'types';

export const useShardEndpoints = (taskName: string, taskType: Entity) => {
    const dictionaryVal = useShardDetail_readDictionary(taskName, taskType);

    const gateway = useScopedGatewayAuthToken(taskName);
    const gatewayHostname = useMemo(() => {
        if (gateway.data?.gateway_url) {
            // Even though `gateway_url` is already a `URL` object, the
            // `host` property returns `null` for some $jsReason
            const url = new URL(gateway.data.gateway_url.toString());
            return url.host;
        }

        return null;
    }, [gateway.data?.gateway_url]);

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
