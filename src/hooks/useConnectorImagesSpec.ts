import { connectorsEndpoint } from 'entities/connectors';
import { useAsync } from 'hooks/useAsync';
import JsonRefs from 'json-refs';
import { useEffect } from 'react';

interface Data {
    endpointSchema: any;
    links: {
        discovery: string;
        documentation: string;
    };
}

const defaultData: Data = {
    endpointSchema: {},
    links: {
        discovery: '',
        documentation: '',
    },
};

const useConnectorImageSpec = (specURL: string) => {
    const response = useAsync<Data>(defaultData);
    const { run, setError } = response;

    useEffect(() => {
        if (specURL.length > 0) {
            run(
                connectorsEndpoint.images.spec
                    .read(specURL)
                    .then((endpointResponse) => {
                        const { data } = endpointResponse;
                        return JsonRefs.resolveRefs(
                            data.attributes.endpointSpecSchema
                        )
                            .then((derefSchema) => {
                                console.log('blub', derefSchema);

                                return Promise.resolve({
                                    endpointSchema: derefSchema.resolved,
                                    links: {
                                        discovery: data.links.discovery,
                                        documentation:
                                            data.attributes.documentationURL,
                                    },
                                });
                            })
                            .catch((resolveRefError: any) => {
                                return Promise.reject(resolveRefError.message);
                            });
                    })
            );
        }
    }, [run, setError, specURL]);

    return response;
};

export default useConnectorImageSpec;
