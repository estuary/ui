import { useAsyncHandler } from 'hooks/useAsyncHandler';
import JsonRefs from 'json-refs';
import { useEffect } from 'react';
import { callSupabase, supabase } from 'services/supabase';

const generateResponse = async (endpointResponse: any) => {
    const { data } = endpointResponse;
    const derefSchema = await JsonRefs.resolveRefs(data.endpoint_spec_schema);

    data.endpoint_spec_schema = derefSchema.resolved;

    return new Promise<any>((resolve) => {
        resolve(data);
    });
};

function useConnectorTags(imageId?: string) {
    const response = useAsyncHandler<any>();
    const { run } = response;

    useEffect(() => {
        if (imageId && imageId.length > 0) {
            run(
                callSupabase(
                    supabase
                        .from('connector_tags')
                        .select(
                            `endpoint_spec_schema, documentation_url, connectors(image_name)`
                        )
                        .eq('id', imageId)
                        .limit(1)
                        .single()
                ).then(generateResponse)
            );
        }
    }, [imageId, run]);

    return response;
}

export default useConnectorTags;
