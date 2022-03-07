import { sourcesEndpoint, SourcesResponse } from 'endpoints/sources';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';
import { BaseHook } from '../types';

const useSourceTypes = (): BaseHook<SourcesResponse> => {
    const { data, error, isIdle, isLoading, run } = useAsync<SourcesResponse>();

    useEffect(() => {
        run(
            sourcesEndpoint.read().then((serverResponse) => {
                return Promise.resolve(serverResponse);
            })
        );
    }, [run]);

    return {
        data,
        error,
        idle: isIdle,
        loading: isLoading,
    };
};

export default useSourceTypes;
