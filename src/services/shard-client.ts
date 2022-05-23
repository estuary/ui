import { ShardClient, ShardSelector } from 'data-plane-gateway';
import { SetShards } from 'stores/ShardDetail';
import { LiveSpecsExtBaseQuery } from 'types';

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

    // TODO: Determine how frequently this data should be polled and an approach to do so. This function should be broken out
    // from the useGatewayAuthToken hook and placed in its own hook driven by useEffect.
    shardClient
        .list(taskSelector)
        .then((result) => {
            const shards = result.unwrap();

            if (shards.length > 0) {
                setShards(shards);
            }
        })
        .catch((error) => Promise.reject(error));
};

export default getShardList;
