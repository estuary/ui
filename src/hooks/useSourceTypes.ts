import { sourcesEndpoint, SourcesResponse } from 'entities/sources';
import { useAsync, UseAsyncResponse } from 'hooks/useAsync';
import { useEffect } from 'react';

const useSourceTypes = (): UseAsyncResponse<SourcesResponse> => {
    const response = useAsync<SourcesResponse>();
    const { run } = response;

    useEffect(() => {
        run(
            sourcesEndpoint.read().then((serverResponse) => {
                return Promise.resolve(serverResponse);
            })
        );
    }, [run]);

    return response;
};

export default useSourceTypes;
