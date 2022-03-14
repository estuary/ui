import { ConnectorImage, connectorsEndpoint } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

const useConnectorImages = (imagesURL: string, index: number = 0) => {
    const response = useAsync<ConnectorImage>();
    const { run } = response;

    useEffect(() => {
        if (imagesURL) {
            run(
                connectorsEndpoint.images
                    .read(imagesURL)
                    .then((serverResponse) => {
                        const newestImage = serverResponse.data[index];

                        return Promise.resolve(newestImage);
                    })
            );
        }
    }, [imagesURL, run, index]);

    return response;
};

export default useConnectorImages;
