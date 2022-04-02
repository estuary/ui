import { Connector, connectorsEndpoint } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

function useConnectors() {
    const response = useAsync<Connector[]>();
    const { run } = response;

    useEffect(() => {
        run(
            connectorsEndpoint.read().then(({ data }) => {
                return Promise.resolve(data);
            })
        );
    }, [run]);

    return response;
}

export default useConnectors;
