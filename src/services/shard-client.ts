import { CombinedGrantsExtQuery } from 'context/PreFetchData';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import getGatewayAuthConfig from 'services/gateway-auth-config';
import { SetShards } from 'stores/ShardDetail';
import { LiveSpecsExtBaseQuery } from 'types';
import {
    getStoredGatewayAuthConfig,
    removeGatewayAuthConfig,
    storeGatewayAuthConfig,
} from 'utils/env-utils';

enum ErrorFlags {
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

const getShardList = <T extends LiveSpecsExtBaseQuery>(
    specs: T[],
    setShards: SetShards,
    sessionKey: string,
    grantDetails: CombinedGrantsExtQuery[]
) => {
    console.log('    i:2');
    const gatewayConfig = getStoredGatewayAuthConfig();

    if (gatewayConfig?.gateway_url && gatewayConfig.token) {
        const authToken = gatewayConfig.token;
        const baseUrl = new URL(gatewayConfig.gateway_url);
        const shardClient = new ShardClient(baseUrl, authToken);
        const taskSelector = new ShardSelector();

        specs
            .map((spec) => spec.catalog_name)
            .forEach((name) => taskSelector.task(name));

        shardClient
            .list(taskSelector)
            .then((result) => {
                console.log('      i:3');
                const shards = result.unwrap();

                if (shards.length > 0) {
                    setShards(shards);
                }
            })
            .catch((error: string) => {
                console.log('      i:4');
                if (
                    error.includes(ErrorFlags.TOKEN_INVALID) ||
                    error.includes(ErrorFlags.TOKEN_NOT_FOUND) ||
                    error.includes(ErrorFlags.OPERATION_INVALID)
                ) {
                    removeGatewayAuthConfig();

                    const prefixes: string[] = grantDetails.map(
                        ({ object_role }) => object_role
                    );

                    getGatewayAuthConfig(prefixes, sessionKey)
                        .then(([response]) => {
                            storeGatewayAuthConfig(response);
                        })
                        .catch((configError) => Promise.reject(configError));
                }

                return Promise.reject(error);
            });
    } else {
        throw Error('Unable to fetch shards due to missing data');
    }
};

export default getShardList;
