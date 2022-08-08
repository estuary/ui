import { TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelect } from './supabase-swr/';

interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
}

const queryColumns = ['catalog_name', 'spec_type'];

const defaultResponse: LiveSpecsQuery[] = [];

function useLiveSpecs(specType: string) {
    const draftSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: (query) => query.eq('spec_type', specType),
        },
        [specType]
    );

    const { data, error } = useSelect(draftSpecQuery);

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
    };
}

const specQuery = ['id', 'catalog_name', 'spec'];
export function useLiveSpecs_spec(collectionNames?: string[]) {
    const liveSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: specQuery,
            filter: (query) =>
                query.filter('catalog_name', 'in', `(${collectionNames})`),
        },
        [collectionNames]
    );

    const { data, error } = useSelect(
        hasLength(collectionNames) ? liveSpecQuery : null
    );

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
    };
}

export default useLiveSpecs;
