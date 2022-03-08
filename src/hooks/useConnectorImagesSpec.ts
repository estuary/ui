import {
    ConnectorImagesSpecResponse,
    connectorsEndpoint,
} from 'entities/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

const useConnectorImageSpec = (specURL: string) => {
    const response = useAsync<ConnectorImagesSpecResponse>();
    const { run, setError } = response;

    useEffect(() => {
        if (specURL.length > 0) {
            run(connectorsEndpoint.images.spec.read(specURL));
        }
    }, [run, setError, specURL]);

    return response;
};

export default useConnectorImageSpec;
