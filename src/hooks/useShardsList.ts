import { SetShards } from 'stores/ShardDetail';
import useSWR from 'swr';

const shardsListEndpoint = 'http://localhost:28318/v1/shards/list';

const fetcher = (_url: string, entityType: 'capture' | 'materialization') => {
    return fetch(shardsListEndpoint, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            selector: {
                include: {
                    labels: [
                        {
                            name: 'estuary.dev/task-type',
                            value: entityType,
                        },
                    ],
                },
                exclude: { labels: [] },
            },
        }),
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            return res.text().then((text) => {
                throw new Error(text);
            });
        }
    });
};

const useShardsList = (
    entityType: 'capture' | 'materialization',
    setShards: SetShards
) => {
    return useSWR([shardsListEndpoint, entityType], fetcher, {
        onSuccess: ({ shards }) => {
            setShards(shards);
        },
        onError: (error) => {
            console.log(error);
        },
    });
};

export default useShardsList;
