import { useEffect, useState } from 'react';
import axios from 'services/axios';
import { BaseHook } from 'types/';

interface ConnectorImagesService extends BaseHook {
    data: {
        attributes: any;
        links: any;
    };
}

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
        data: {
            attributes,
            links,
        },
        error,
        loading,
    };
};

export default useConnectorImages;
