import { Auth } from '@supabase/ui';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useMemo } from 'react';
import { logRocketConsole } from 'services/logrocket';
import useSWR from 'swr';
import { LiveSpecsExtBareMinimum } from 'types';

enum ErrorFlags {
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;

const useShardsList = <T extends LiveSpecsExtBareMinimum>(specs: T[]) => {
    const { session } = Auth.useUser();

    const { data: gatewayConfig, refresh: refreshAccess } = useGatewayAuthToken(
        specs.map((spec) => spec.catalog_name)
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

    const taskSelector = new ShardSelector();

    specs
        .map((spec) => spec.catalog_name)
        .forEach((name) => taskSelector.task(name));

    const fetcher = async (_url: string) => {
        if (!(shardClient && session)) {
            return { shards: [], error: null };
        }
        try {
            const result = await shardClient.list(taskSelector);
            const shards = result.unwrap();

            return {
                shards: shards.length > 0 ? shards : [],
                error: null,
            };
            // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        } catch (error: any) {
            logRocketConsole('ShardsList : error : ', error);

            return {
                shards: [],
                error: error?.message ?? error,
            };
        }
    };

    return useSWR(
        specs.length > 0
            ? `shards-${
                  gatewayConfig?.gateway_url ?? '__missing_gateway_url__'
              }-${specs.map((spec) => spec.id).join('-')}`
            : null,
        fetcher,
        {
            errorRetryCount: 3,
            errorRetryInterval: INTERVAL / 2,
            refreshInterval: INTERVAL,
            revalidateOnFocus: false, // We're already refreshing and these status do not change often
            onError: async (error: string | Error) => {
                logRocketConsole('useShardsList on error', { error });
                if (typeof error === 'object') {
                    return Promise.reject(error.message);
                }

                if (
                    error.includes(ErrorFlags.TOKEN_INVALID) ||
                    error.includes(ErrorFlags.TOKEN_NOT_FOUND)
                ) {
                    await refreshAccess();
                }

                return Promise.reject(error);
            },
        }
    );
};

export default useShardsList;
