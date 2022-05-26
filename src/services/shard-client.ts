import { CombinedGrantsExtQuery } from 'context/PreFetchData';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import getGatewayAuthConfig from 'services/gateway-auth-config';
import { SetShards } from 'stores/ShardDetail';
import { LiveSpecsExtBaseQuery } from 'types';
import {
    removeGatewayAuthConfig,
    storeGatewayAuthConfig,
} from 'utils/env-utils';

enum ErrorFlags {
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

const getShardList = <T extends LiveSpecsExtBaseQuery>(
    baseUrl: URL,
    authToken: string,
    specs: T[],
    setShards: SetShards,
    sessionKey: string,
    grantDetails: CombinedGrantsExtQuery[]
) => {
    const shardClient = new ShardClient(baseUrl, authToken);
    const taskSelector = new ShardSelector();

    specs
        .map((spec) => spec.catalog_name)
        .forEach((name) => taskSelector.task(name));

    shardClient
        .list(taskSelector)
        .then((result) => {
            const shards = result.unwrap();

            if (shards.length > 0) {
                setShards(shards);
            }
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

                getGatewayAuthConfig(prefixes, sessionKey)
                    .then(([response]) => {
                        storeGatewayAuthConfig(response);
                    })
                    .catch((configError) => Promise.reject(configError));
            }

            return Promise.reject(error);
        });
};

export default getShardList;
