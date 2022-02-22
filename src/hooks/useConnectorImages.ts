import { useEffect, useState } from 'react';
import axios from 'services/axios';

type ConnectorImagesService = {
    isFetchingConnectorImages: boolean;
    connectorImageAttributes: any;
    connectorImageLinks: any;
    connectorImageError: any;
};

const useConnectorImages = (
    imagesURL: string,
    whichOne: number = 0
): ConnectorImagesService => {
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [attributes, setAttributes] = useState<object>({});
    const [links, setLinks] = useState<object>({});

    useEffect(() => {
        setIsFetching(true);
        setError(null);
        if (imagesURL) {
            console.log('useConnectorImages2');
            axios
                .get(imagesURL)
                .then(async (imageResponse: any) => {
                    console.log('useConnectorImages3');
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
        }
    }, [imagesURL, whichOne]);

    return {
        isFetchingConnectorImages: isFetching,
        connectorImageAttributes: attributes,
        connectorImageLinks: links,
        connectorImageError: error,
    };
};

export default useConnectorImages;
