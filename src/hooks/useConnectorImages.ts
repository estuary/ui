import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type ConnectorImagesService = {
    isFetchingConnectorImages: boolean;
    connectorImageAttributes: any;
    connectorImageLinks: any;
    connectorImageError: any;
    fetchConnectorImages: any;
};

const useConnectorImages = (
    imagesURL: string,
    whichOne: number = 0
): ConnectorImagesService => {
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [attributes, setAttributes] = useState<object>({});
    const [links, setLinks] = useState<object>({});

    const fetchSchema = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios
            .get(imagesURL)
            .then(async (imageResponse: any) => {
                const newestImage = imageResponse.data.data[whichOne];
                setAttributes(newestImage.attributes);
                setLinks(newestImage.links);
            })
            .catch((imageError: any) => {
                setError(
                    imageError.response
                        ? imageError.response.data.message
                        : imageError.message
                );
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, [imagesURL, whichOne]);

    useEffect(() => {
        (async () => {
            if (imagesURL) {
                await fetchSchema();
            }
        })();
    }, [fetchSchema, imagesURL]);

    return {
        isFetchingConnectorImages: isFetching,
        connectorImageAttributes: attributes,
        connectorImageLinks: links,
        connectorImageError: error,
        fetchConnectorImages: fetchSchema,
    };
};

export default useConnectorImages;
