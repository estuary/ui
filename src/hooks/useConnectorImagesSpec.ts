import {
    ConnectorImagesSpecResponse,
    connectorsEndpoint,
} from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import JsonRefs from 'json-refs';
import { useEffect } from 'react';

interface Data {
    endpointSchema: ConnectorImagesSpecResponse['data']['attributes']['endpointSpecSchema'];
    links: {
        discovery: ConnectorImagesSpecResponse['data']['links']['discovery'];
        documentation: ConnectorImagesSpecResponse['data']['attributes']['documentationURL'];
    };
}

const defaultData: Data = {
    endpointSchema: {},
    links: {
        discovery: '',
        documentation: '',
    },
};

const generateResponse = async (
    endpointResponse: ConnectorImagesSpecResponse
) => {
    const { data } = endpointResponse;
    const derefSchema = await JsonRefs.resolveRefs(
        data.attributes.endpointSpecSchema
    );

    return new Promise<Data>((resolve) => {
        resolve({
            endpointSchema: derefSchema.resolved,
            links: {
                discovery: data.links.discovery,
                documentation: data.attributes.documentationURL,
            },
        });
    });
};

const useConnectorImageSpec = (specURL: string) => {
    const response = useAsync<Data>(defaultData);
    const { run, setError } = response;

    useEffect(() => {
        if (specURL.length > 0) {
            run(
                connectorsEndpoint.images.spec
                    .read(specURL)
                    .then(generateResponse)
            );
        }
    }, [run, setError, specURL]);

    return response;
};

export default useConnectorImageSpec;
