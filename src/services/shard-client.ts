import { LiveSpecsExtQuery } from 'components/tables/Captures';
import { ShardClient, ShardSelector } from 'data-plane-gateway';

const getShardList = (
    baseUrl: URL,
    authToken: string,
    specs: LiveSpecsExtQuery[],
    setShards: any
) => {
    const shardClient = new ShardClient(baseUrl, authToken);
    const taskSelector = new ShardSelector();

    specs
        .map(({ catalog_name }) => catalog_name)
        .sort()
        .forEach((name) => taskSelector.task(name));

    // TODO: Determine how frequently this data should be polled and an approach to do so. Since useSWR is
    // the caller of this function, the refreshInterval setting may be a contender.
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
