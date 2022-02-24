import { useEffect, useState } from 'react';
import axios, { withAxios } from 'services/axios';
import { BaseHook } from 'types/';
import { useAuth } from '../auth/Context';

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

    const auth = useAuth();

    useEffect(() => {
        if (imagesURL) {
            withAxios(axios.get(imagesURL), setError, setLoading, auth)
                .then((imageResponse: any) => {
                    const newestImage = imageResponse.data.data[whichOne];
                    setAttributes(newestImage.attributes);
                    setLinks(newestImage.links);
                })
                .catch(() => {});
        }
    }, [auth, imagesURL, whichOne]);

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
