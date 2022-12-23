import { Auth } from '@supabase/ui';
import { useGrantDetails } from 'context/fetcher/GrantDetails';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import LogRocket from 'logrocket';
import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import getGatewayAuthConfig from 'services/gateway-auth-config';
import useSWR from 'swr';
import { LiveSpecsExtBaseQuery } from 'types';
import {
    getStoredGatewayAuthConfig,
    LocalStorageKeys,
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
    const grantDetails = useGrantDetails();

    const [gatewayConfig, setGatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    const shardClient = useMemo(() => {
        if (gatewayConfig?.gateway_url && gatewayConfig.token) {
            const authToken = gatewayConfig.token;
            const baseUrl = new URL(gatewayConfig.gateway_url);

            return new ShardClient(baseUrl, authToken);
        } else {
            return null;
        }
    }, [gatewayConfig]);

    if (shardClient !== null && session) {
        const taskSelector = new ShardSelector();

        specs
            .map((spec) => spec.catalog_name)
            .forEach((name) => taskSelector.task(name));

        const fetcher = (_url: string) => {
            return shardClient.list(taskSelector).then(
                (result) => {
                    const shards = result.unwrap();

                    return {
                        shards: shards.length > 0 ? shards : [],
                        error: null,
                    };
                },
                (error: any) => {
                    LogRocket.log('ShardsList : error : ', error);

                    return {
                        shards: [],
                        error: error.message ?? error,
                    };
                }
            );
        };

        return useSWR(
            specs.length > 0
                ? `shards-${
                      gatewayConfig?.gateway_url ?? '__missing_gateway_url__'
                  }-${specs.map((spec) => spec.id).join('-')}`
                : null,
            fetcher,
            {
                errorRetryInterval: INTERVAL / 2,
                refreshInterval: INTERVAL,
                revalidateOnFocus: false, // We're already refreshing and these status do not change often
                onError: (error: string | Error) => {
                    if (typeof error === 'object') {
                        return Promise.reject(error.message);
                    }

                    if (
                        error.includes(ErrorFlags.TOKEN_INVALID) ||
                        error.includes(ErrorFlags.TOKEN_NOT_FOUND)
                    ) {
                        const prefixes: string[] = grantDetails.map(
                            ({ object_role }) => object_role
                        );

                        getGatewayAuthConfig(prefixes, session.access_token)
                            .then(([response]) => {
                                setGatewayConfig(response);
                            })
                            .catch((configError) =>
                                Promise.reject(configError)
                            );
                    }

                    return Promise.reject(error);
                },
            }
        );
    } else {
        throw Error('Unable to fetch shards due to missing data');
    }
};

export default useShardsList;
