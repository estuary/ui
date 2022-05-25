import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

export interface PublicationSpecQuery {
    pub_id: string;
    live_spec_id: string;
    published_at: string;
    live_specs: {
        id: string;
        catalog_name: string;
        last_pub_id: string;
        spec: any;
        spec_type: string;
        connector_image_name: string;
        connector_image_tag: string;
    }[];
}

const PUB_SPEC_QUERY = `
    pub_id,
    live_spec_id,
    published_at,
    live_specs (
        id, 
        catalog_name,
        last_pub_id,
        spec,
        spec_type,
        connector_image_name,
        connector_image_tag
    )
`;

function usePublicationSpecs(lastPubId: string | null) {
    const publicationsQuery = useQuery<PublicationSpecQuery>(
        TABLES.PUBLICATION_SPECS,
        {
            columns: PUB_SPEC_QUERY,
            filter: (query) => query.eq('pub_id', lastPubId as string),
        },
        [lastPubId]
    );

    const { data, error } = useSelect(lastPubId ? publicationsQuery : null);

    return {
        publicationSpecs: data ? data.data : [],
        error,
    };
}

export default usePublicationSpecs;
