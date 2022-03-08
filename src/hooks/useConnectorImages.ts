import {
    ConnectorImageResponse,
    connectorsEndpoint,
} from 'entities/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

const useConnectorImages = (imagesURL: string, whichOne: number = 0) => {
    console.log('useconnectorimages');

    const response = useAsync<ConnectorImageResponse>();
    const { run } = response;

    useEffect(() => {
        console.log('useconnectorimages effect');
        if (imagesURL) {
            console.log('useconnectorimages making call', imagesURL);
            run(
                connectorsEndpoint.images
                    .read(imagesURL)
                    .then((serverResponse) => {
                        console.log('useconnectorimages making call response');
                        const newestImage = serverResponse.data[whichOne];

                        return Promise.resolve(newestImage);
                    })
            );
        }
    }, [imagesURL, run, whichOne]);

    return response;
};

export default useConnectorImages;
