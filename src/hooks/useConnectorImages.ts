import axios from 'axios';
import JsonRefs from 'json-refs';
import { useCallback, useEffect, useState } from 'react';

type ConnectorImagesService = {
    isFetchingConnectorImages: boolean;
    connectorImageSpecSchema: any;
    connectorImageError: any;
    connectorImageName: any;
    connectorImageDocumentation: any;
    fetchConnectorImages: any;
};

const useConnectorImageSpec = (imagesURL: string): ConnectorImagesService => {
    const [connectorImage, setConnectorImage] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [docs, setDocs] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const fetchSchema = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios.get(imagesURL).then(async (imageResponse: any) => {
            const newestImage = imageResponse.data.data[0];
            setName(newestImage.attributes.name);

            axios
                .get(newestImage.links.spec)
                .then(async (specResponse: any) => {
                    const { data } = specResponse.data;

                    setDocs(data.attributes.documentationURL);
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
                })
                .catch((error: any) => {
                    setError(
                        error.response
                            ? error.response.data.message
                            : error.message
                    );
                })
                .finally(() => {
                    setIsFetching(false);
                });
        });
    }, [imagesURL]);

    useEffect(() => {
        (async () => {
            if (imagesURL) {
                await fetchSchema();
            }
        })();
    }, [fetchSchema, imagesURL]);

    return {
        isFetchingConnectorImages: isFetching,
        connectorImageSpecSchema: connectorImage,
        connectorImageError: error,
        connectorImageName: name,
        connectorImageDocumentation: docs,
        fetchConnectorImages: fetchSchema,
    };
};

export default useConnectorImageSpec;
