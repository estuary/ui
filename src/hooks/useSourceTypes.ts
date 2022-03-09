import { sourcesEndpoint, SourcesResponse } from 'endpoints/sources';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

const useSourceTypes = () => {
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
