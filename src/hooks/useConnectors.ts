import { connectorsEndpoint, ConnectorsResponse } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';
import { BaseHook } from 'types';

function useConnectors(): BaseHook<ConnectorsResponse> {
    console.log('useConnectors ');

    const { data, error, isIdle, isLoading, run } =
        useAsync<ConnectorsResponse>();

    useEffect(() => {
        console.log('useConnectors run');
        run(connectorsEndpoint.read());
    }, [run]);

    return {
        data,
        error,
        idle: isIdle,
        loading: isLoading,
    };
}

export default useConnectors;
