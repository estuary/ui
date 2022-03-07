import { connectorsEndpoint, ConnectorsResponse } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';
import { type BaseHookNullableData } from 'types';

function useConnectors(): BaseHookNullableData<ConnectorsResponse['data']> {
    const { data, error, isIdle, isLoading, run } =
        useAsync<ConnectorsResponse['data']>();

    useEffect(() => {
        run(
            connectorsEndpoint.read().then((serverResponse) => {
                return Promise.resolve(serverResponse.data);
            })
        );
    }, [run]);

    return {
        data,
        error,
        idle: isIdle,
        loading: isLoading,
    };
}

export default useConnectors;
