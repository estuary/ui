import { ConnectorImageData, connectorsEndpoint } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

const useConnectorImages = (imagesURL: string, whichOne: number = 0) => {
    const response = useAsync<ConnectorImageData>();
    const { run } = response;

    useEffect(() => {
        if (imagesURL) {
            run(
                connectorsEndpoint.images
                    .read(imagesURL)
                    .then((serverResponse) => {
                        const newestImage = serverResponse.data[whichOne];

                        return Promise.resolve(newestImage);
                    })
            );
        }
    }, [imagesURL, run, whichOne]);

    return response;
};

export default useConnectorImages;
