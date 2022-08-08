import { TABLES } from 'services/supabase';
import { ENTITY } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

export interface PublicationSpecConfig {
    lastPubId: string | null;
    entityType: ENTITY;
    liveSpecId?: string;
    collectionNames?: string[];
}

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
    ['live_specs.spec_type']: string;
    ['live_specs.catalog_name']: string;
}

const PUB_SPEC_QUERY = `
    pub_id,
    live_spec_id,
    published_at,
    live_specs !inner(
        id, 
        catalog_name,
        last_pub_id,
        spec,
        spec_type,
        connector_image_name,
        connector_image_tag
    )
`;
const defaultResponse: PublicationSpecQuery[] = [];

function usePublicationSpecs({
    lastPubId,
    entityType,
    liveSpecId,
}: PublicationSpecConfig) {
    const publicationsQuery = useQuery<PublicationSpecQuery>(
        TABLES.PUBLICATION_SPECS,
        {
            columns: PUB_SPEC_QUERY,
            filter: (query) =>
                liveSpecId
                    ? query.eq('live_spec_id', liveSpecId)
                    : query
                          .eq('pub_id', lastPubId as string)
                          .eq('live_specs.spec_type', entityType),
        },
        [lastPubId, liveSpecId]
    );

    const { data, error } = useSelect(
        lastPubId || liveSpecId ? publicationsQuery : null
    );

    return {
        publicationSpecs: data ? data.data : defaultResponse,
        error,
    };
}

export function usePublicationSpecs_relatedCollections({
    lastPubId,
    liveSpecId,
    collectionNames,
}: Pick<
    PublicationSpecConfig,
    'lastPubId' | 'liveSpecId' | 'collectionNames'
>) {
    const publicationsQuery = useQuery<PublicationSpecQuery>(
        TABLES.PUBLICATION_SPECS,
        {
            columns: PUB_SPEC_QUERY,
            filter: (query) => {
                return query
                    .filter(
                        'live_specs.catalog_name',
                        'in',
                        `(${collectionNames})`
                    )
                    .order('published_at')
                    .limit(1);
            },
        },
        [lastPubId, liveSpecId, collectionNames]
    );

    const { data, error } = useSelect(
        collectionNames ? publicationsQuery : null
    );

    return {
        collectionSpecs: data ? data.data : defaultResponse,
        error,
    };
}

export default usePublicationSpecs;
