import {
    ConnectorImagesSpecAttributes,
    ConnectorImagesSpecLinks,
    ConnectorImagesSpecResponse,
    connectorsEndpoint,
} from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import JsonRefs from 'json-refs';
import { useEffect } from 'react';

interface Data {
    endpointSchema: ConnectorImagesSpecAttributes['endpointSpecSchema'];
    links: {
        discovered_catalog: ConnectorImagesSpecLinks['discovered_catalog'];
        documentation: ConnectorImagesSpecAttributes['documentationURL'];
    };
}

const getDefaultData = (): Data => {
    return {
        endpointSchema: {},
        links: {
            discovered_catalog: '',
            documentation: '',
        },
    };
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
                discovered_catalog: data.links.discovered_catalog,
                documentation: data.attributes.documentationURL,
            },
        });
    });
};

const useConnectorImageSpec = (specURL: string) => {
    const response = useAsync<Data>(getDefaultData());
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
