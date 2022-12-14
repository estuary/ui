import { endOfYesterday, formatISO } from 'date-fns';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { CatalogStats } from 'types';

export type StatsFilter =
    | 'today'
    | 'yesterday'
    | 'lastWeek'
    | 'thisWeek'
    | 'lastMonth'
    | 'thisMonth';

const getStatsByName = (names: string[], filter?: StatsFilter) => {
    let queryBuilder = supabaseClient
        .from<CatalogStats>(TABLES.CATALOG_STATS)
        .select(
            `    
                    catalog_name,
                    grain,
                    bytes_written_by_me,
                    docs_written_by_me,
                    bytes_read_by_me,
                    docs_read_by_me,
                    bytes_written_to_me,
                    docs_written_to_me,
                    bytes_read_from_me,
                    docs_read_from_me,
                    ts
                `
        )
        .in('catalog_name', names)
        .order('catalog_name');

    // TODO (stats) : finish the queries
    switch (filter) {
        case 'today':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(endOfYesterday()))
                .eq('grain', 'hourly');
            break;
        default:
            throw new Error('Unsupported filter used in Stats Query');
    }

    return queryBuilder.then(handleSuccess<CatalogStats[]>, handleFailure);
};

export { getStatsByName };
