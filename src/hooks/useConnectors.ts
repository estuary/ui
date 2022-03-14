import { Connector, connectorsEndpoint } from 'endpoints/connectors';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

function useConnectors(type?: string) {
    const response = useAsync<Connector[]>();
    const { run } = response;

    useEffect(() => {
        run(
            connectorsEndpoint.read().then((serverResponse) => {
                if (type) {
                    const filteredResponse = serverResponse.data.filter(
                        (connector) => {
                            return connector.type === type;
                        }
                    );

                    return Promise.resolve(filteredResponse);
                } else {
                    return Promise.resolve(serverResponse.data);
                }
            })
        );
    }, [run, type]);

    return response;
}

export default useConnectors;
