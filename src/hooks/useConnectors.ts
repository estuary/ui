import { connectorsEndpoint, ConnectorsResponse } from 'entities/connectors';
import { useAsync, UseAsyncResponse } from 'hooks/useAsync';
import { useEffect } from 'react';

function useConnectors(): UseAsyncResponse<ConnectorsResponse> {
    const response = useAsync<ConnectorsResponse>();
    const { run } = response;

    useEffect(() => {
        run(connectorsEndpoint.read());
    }, [run]);

    return response;
}

export default useConnectors;
