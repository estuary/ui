import { type NewCaptureState } from 'components/capture/creation/Reducer';
import JsonRefs from 'json-refs';
import { useEffect, useState } from 'react';
import axios, { withAxios } from 'services/axios';
import { type BaseHook } from 'types';

interface ConnectorImagesService extends BaseHook {
    data: {
        specSchema: any;
        links: Pick<NewCaptureState['links'], 'discovery' | 'documentation'>;
    };
}

const useConnectorImageSpec = (specURL: string): ConnectorImagesService => {
    const [schema, setSchema] = useState<object>({});
    const [error, setError] = useState<string | null>(null);
    const [discovery, setDiscovery] = useState<string>('');
    const [docs, setDocs] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (specURL) {
            setLoading(true);
            setError(null);
            withAxios(axios.get(specURL), setError, setLoading)
                .then((specResponse: any) => {
                    const { data } = specResponse.data;
                    JsonRefs.resolveRefs(data.attributes.endpointSpecSchema)
                        .then((derefSchema) => {
                            setSchema(derefSchema.resolved);
                        })
                        .catch((resolveRefError) => {
                            setSchema({});
                            setError(resolveRefError.message);
                        });

                    setDiscovery(data.links.discovery);
                    setDocs(data.attributes.documentationURL);
                })
                .catch(() => {});
        }
    }, [specURL]);

    return {
        data: {
            links: {
                discovery,
                documentation: docs,
            },
            specSchema: schema,
        },
        error,
        loading,
    };
};

export default useConnectorImageSpec;
