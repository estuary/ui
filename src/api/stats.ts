import {
    endOfMonth,
    endOfWeek,
    endOfYesterday,
    formatISO,
    startOfMonth,
    startOfWeek,
    startOfYesterday,
    subMonths,
    subWeeks,
} from 'date-fns';
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

    const today = new Date();
    const lastWeek = subWeeks(today, 1);
    const lastMonth = subMonths(today, 1);

    // TODO (stats) : finish the queries
    switch (filter) {
        case 'today':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(endOfYesterday()))
                .eq('grain', 'hourly');
            break;
        case 'yesterday':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(startOfYesterday()))
                .lte('ts', formatISO(endOfYesterday()))
                .eq('grain', 'daily');
            break;

        case 'thisWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(startOfWeek(today)))
                .lte('ts', formatISO(endOfWeek(today)))
                .eq('grain', 'daily');
            break;
        case 'lastWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(startOfWeek(lastWeek)))
                .lte('ts', formatISO(endOfWeek(lastWeek)))
                .eq('grain', 'daily');
            break;

        case 'thisMonth':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(startOfMonth(today)))
                .lte('ts', formatISO(endOfMonth(today)))
                .eq('grain', 'monthly');
            break;
        case 'lastMonth':
            queryBuilder = queryBuilder
                .gte('ts', formatISO(startOfMonth(lastMonth)))
                .lte('ts', formatISO(endOfMonth(lastMonth)))
                .eq('grain', 'monthly');
            break;

        default:
            throw new Error('Unsupported filter used in Stats Query');
    }

    return queryBuilder.then(handleSuccess<CatalogStats[]>, handleFailure);
};

export { getStatsByName };
