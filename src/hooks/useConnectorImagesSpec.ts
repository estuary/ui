import axios from 'axios';
import JsonRefs from 'json-refs';
import { useCallback, useEffect, useState } from 'react';

type ConnectorImagesService = {
    isFetchingConnectorImageSpec: boolean;
    connectorImageSpecSchema: object | null;
    connectorImageSpecError: any;
    connectorImageDocumentation: string;
    connectorImageDiscoveryLink: string;
    fetchConnectorImages: any;
};

const useConnectorImageSpec = (specURL: string): ConnectorImagesService => {
    const [connectorImage, setConnectorImage] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [discovery, setDiscovery] = useState<string>('');
    const [docs, setDocs] = useState<string>('');
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const fetchSchema = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios
            .get(specURL)
            .then(async (specResponse: any) => {
                const { data } = specResponse.data;

                try {
                    JsonRefs.resolveRefs(
                        data.attributes.endpointSpecSchema
                    ).then((derefSchema) => {
                        setConnectorImage(derefSchema.resolved);
                    });
                } catch (error: any) {
                    setConnectorImage(null);
                    setError(error.message);
                }

                setDiscovery(data.links.discovery);
                setDocs(data.attributes.documentationURL);
            })
            .catch((error: any) => {
                setError(
                    error.response ? error.response.data.message : error.message
                );
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, [specURL]);

    useEffect(() => {
        (async () => {
            if (specURL) {
                await fetchSchema();
            }
        })();
    }, [fetchSchema, specURL]);

    return {
        isFetchingConnectorImageSpec: isFetching,
        connectorImageSpecSchema: connectorImage,
        connectorImageSpecError: error,
        connectorImageDocumentation: docs,
        connectorImageDiscoveryLink: discovery,
        fetchConnectorImages: fetchSchema,
    };
};

export default useConnectorImageSpec;
