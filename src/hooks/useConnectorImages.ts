import { useEffect, useState } from 'react';
import axios from 'services/axios';

type ConnectorImagesService = {
    loading: boolean;
    data: {
        attributes: any;
        links: any;
    };
    error: any;
};

const useConnectorImages = (
    imagesURL: string,
    whichOne: number = 0
): ConnectorImagesService => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [attributes, setAttributes] = useState<object>({});
    const [links, setLinks] = useState<object>({});

    useEffect(() => {
        setLoading(true);
        setError(null);
        if (imagesURL) {
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
                    setLoading(false);
                });
        }
    }, [imagesURL, whichOne]);

    return {
        loading,
        data: {
            attributes,
            links,
        },
        error,
    };
};

export default useConnectorImages;
