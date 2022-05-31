import { Auth } from '@supabase/ui';
import { usePreFetchData } from 'context/PreFetchData';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import getGatewayAuthConfig from 'services/gateway-auth-config';
import useSWR from 'swr';
import { LiveSpecsExtBaseQuery } from 'types';
import {
    getStoredGatewayAuthConfig,
    removeGatewayAuthConfig,
    storeGatewayAuthConfig,
} from 'utils/localStorage-utils';

enum ErrorFlags {
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;

const useShardsList = <T extends LiveSpecsExtBaseQuery>(specs: T[]) => {
    const { session } = Auth.useUser();
    const { grantDetails } = usePreFetchData();

    const gatewayConfig = getStoredGatewayAuthConfig();

    if (gatewayConfig?.gateway_url && gatewayConfig.token && session) {
        const authToken = gatewayConfig.token;
        const baseUrl = new URL(gatewayConfig.gateway_url);
        const shardClient = new ShardClient(baseUrl, authToken);
        const taskSelector = new ShardSelector();

        specs
            .map((spec) => spec.catalog_name)
            .forEach((name) => taskSelector.task(name));

        const fetcher = (_url: string) => {
            console.log('foo', taskSelector);
            return shardClient
                .list(taskSelector)
                .then((result) => {
                    const shards = result.unwrap();

                    return {
                        shards: shards.length > 0 ? shards : [],
                    };
                })
                .catch((error: string) => {
                    if (
                        error.includes(ErrorFlags.TOKEN_INVALID) ||
                        error.includes(ErrorFlags.TOKEN_NOT_FOUND) ||
                        error.includes(ErrorFlags.OPERATION_INVALID)
                    ) {
                        removeGatewayAuthConfig();

                        const prefixes: string[] = grantDetails.map(
                            ({ object_role }) => object_role
                        );

                        getGatewayAuthConfig(prefixes, session.access_token)
                            .then(([response]) => {
                                storeGatewayAuthConfig(response);
                            })
                            .catch((configError) =>
                                Promise.reject(configError)
                            );
                    }

                    return Promise.reject(error);
                });
        };

        return useSWR(gatewayConfig.gateway_url, fetcher, {
            errorRetryInterval: INTERVAL / 2,
            refreshInterval: INTERVAL,
            revalidateOnFocus: false, //We're already refreshing and these status do not change often
        });
    } else {
        throw Error('Unable to fetch shards due to missing data');
    }
};

export default useShardsList;
