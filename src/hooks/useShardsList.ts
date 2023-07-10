import { Auth } from '@supabase/ui';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import { ResponseError } from 'data-plane-gateway/types/util';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useMemo } from 'react';
import { logRocketConsole } from 'services/logrocket';
import useSWR from 'swr';
import { LiveSpecsExtBareMinimum } from 'types';

enum ErrorFlags {
    OPERATION_INVALID = 'Unauthorized',
    TOKEN_EXPIRED = 'token is expired',
    TOKEN_INVALID = 'Authentication failed',
    TOKEN_NOT_FOUND = 'Unauthenticated',
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
            return { shards: [] };
        }

        const result = await shardClient.list(taskSelector);

        // Check for an error
        if (result.err()) {
            // Unwrap the error, log the error, and reject the response
            const error = result.unwrap_err();
            logRocketConsole('ShardsList : error : ', error);
            return Promise.reject(error.body);
        }

        try {
            // No error so should be fine to unwrap
            const shards = result.unwrap();
            return {
                shards: shards.length > 0 ? shards : [],
            };
        } catch (error: unknown) {
            // This is just here to be safe. We'll keep an eye on it and possibly remove
            logRocketConsole('ShardsList : unwrapError : ', error);
            return Promise.reject(error);
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
            onError: async (error: string | ResponseError['body']) => {
                logRocketConsole('useShardsList on error', { error });

                // Try fetching the error message
                const errorMessage =
                    typeof error === 'object' ? error.message : error;

                // Check if we need to refresh the access token before returning the error
                if (
                    errorMessage &&
                    (errorMessage.includes(ErrorFlags.TOKEN_INVALID) ||
                        errorMessage.includes(ErrorFlags.TOKEN_NOT_FOUND) ||
                        errorMessage.includes(ErrorFlags.TOKEN_EXPIRED))
                ) {
                    await refreshAccess();
                }
            },
        }
    );
};

export default useShardsList;
