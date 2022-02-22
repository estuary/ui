import JsonRefs from 'json-refs';
import { useEffect, useState } from 'react';
import axios from 'services/axios';

type ConnectorImagesService = {
    isFetchingConnectorImageSpec: boolean;
    connectorImageSpecSchema: any;
    connectorImageSpecError: any;
    connectorImageDocumentation: string;
    connectorImageDiscoveryLink: string;
};

const useConnectorImageSpec = (specURL: string): ConnectorImagesService => {
    const [connectorImage, setConnectorImage] = useState<object>({});
    const [error, setError] = useState<string | null>(null);
    const [discovery, setDiscovery] = useState<string>('');
    const [docs, setDocs] = useState<string>('');
    const [isFetching, setIsFetching] = useState<boolean>(true);

    useEffect(() => {
        if (specURL) {
            setIsFetching(true);
            setError(null);
            console.log('useConnectorImagesSpec2');
            axios
                .get(specURL)
                .then(async (specResponse: any) => {
                    const { data } = specResponse.data;
                    console.log('useConnectorImagesSpec3');
                    JsonRefs.resolveRefs(data.attributes.endpointSpecSchema)
                        .then((derefSchema) => {
                            setConnectorImage(derefSchema.resolved);
                        })
                        .catch((resolveRefError) => {
                            setConnectorImage({});
                            setError(resolveRefError.message);
                        });

                    setDiscovery(data.links.discovery);
                    setDocs(data.attributes.documentationURL);
                })
                .catch((specError: any) => {
                    setError(
                        specError.response
                            ? specError.response.data.message
                            : specError.message
                    );
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [specURL]);

    return {
        isFetchingConnectorImageSpec: isFetching,
        connectorImageSpecSchema: connectorImage,
        connectorImageSpecError: error,
        connectorImageDocumentation: docs,
        connectorImageDiscoveryLink: discovery,
    };
};

export default useConnectorImageSpec;
