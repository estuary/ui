import { ShardClient, ShardSelector } from 'data-plane-gateway';
import { SetShards } from 'stores/ShardDetail';
import { LiveSpecsExtBaseQuery } from 'types';

// TODO: Follow up on the data plane gateway. These changes should be available on the latest branch as of 2:24PM on 5/24/2022. Confirmation
// and testing required.
enum ErrorFlags {
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

const getShardList = <T extends LiveSpecsExtBaseQuery>(
    baseUrl: URL,
    authToken: string,
    specs: T[],
    setShards: SetShards
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
        .catch((error: Error) => {
            // TODO: Create and call a gateway-auth-token service to generate a new authentication token. The polling done by the useEffect
            // caller for the shard-client will handle making a follow-up call to the shards list API. This error is currently silent. Should
            // the user be notified that a service error is present after a certain number of resolution attempts?
            if (error.message.includes(ErrorFlags.TOKEN_INVALID)) {
                console.log('Call a service that will update the JWT token');
            }

            return Promise.reject(error);
        });
};

export default getShardList;
