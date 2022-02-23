import { type NewCaptureStateType } from 'components/capture/creation/Reducer';
import JsonRefs from 'json-refs';
import { useEffect, useState } from 'react';
import axios from 'services/axios';
import { type BaseHook } from '../types/hooks';

interface ConnectorImagesService extends BaseHook {
    data: {
        specSchema: any;
        links: Pick<
            NewCaptureStateType['links'],
            'discovery' | 'documentation'
        >;
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
            axios
                .get(specURL)
                .then(async (specResponse: any) => {
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
                .catch((specError: any) => {
                    setError(
                        specError.response
                            ? specError.response.data.message
                            : specError.message
                    );
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [specURL]);

    return {
        loading,
        error,
        data: {
            links: {
                discovery,
                documentation: docs,
            },
            specSchema: schema,
        },
    };
};

export default useConnectorImageSpec;
