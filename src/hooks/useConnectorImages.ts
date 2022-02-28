import { useEffect, useState } from 'react';
import axios, { withAxios } from 'services/axios';
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
        if (imagesURL) {
            withAxios(axios.get(imagesURL), setError, setLoading)
                .then((imageResponse: any) => {
                    const newestImage = imageResponse.data.data[whichOne];
                    setAttributes(newestImage.attributes);
                    setLinks(newestImage.links);
                })
                .catch(() => {});
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
