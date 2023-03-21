import {
    endOfWeek,
    format,
    startOfMonth,
    startOfToday,
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
import { CatalogStats, Grants } from 'types';

export type StatsFilter =
    | 'today'
    | 'yesterday'
    | 'lastWeek'
    | 'thisWeek'
    | 'lastMonth'
    | 'thisMonth';

// This will format the date so that it just gets the month, day, year, and hour
//  We do not need the full minute/house/offset because the backend is not saving those
export const formatToUTC = (date: any) =>
    format(
        date,
        // addMinutes(date, date.getTimezoneOffset()),
        "yyyy-MM-dd' 'HH':00:00+00'"
    );

// TODO (stats) add support for which stats columns each entity wants
//  Right now all tables run the same query even though they only need
//  2 - 4 columns. However, not a huge deal perf wise because the other cols
//  are all 0.
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

    switch (filter) {
        // Day Range
        case 'today':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(startOfToday()))
                .eq('grain', 'daily');
            break;
        case 'yesterday':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(startOfYesterday()))
                .eq('grain', 'daily');
            break;

        // Week Range
        case 'thisWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToUTC(startOfWeek(today)))
                .lte('ts', formatToUTC(endOfWeek(today)))
                .eq('grain', 'daily');
            break;
        case 'lastWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToUTC(startOfWeek(lastWeek)))
                .lte('ts', formatToUTC(endOfWeek(lastWeek)))
                .eq('grain', 'daily');
            break;

        // Month Range
        case 'thisMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(startOfMonth(today)))
                .eq('grain', 'monthly');

            break;
        case 'lastMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(startOfMonth(lastMonth)))
                .eq('grain', 'monthly');
            break;

        default:
            throw new Error('Unsupported filter used in Stats Query');
    }

    return queryBuilder.then(handleSuccess<CatalogStats[]>, handleFailure);
};

const getStatsForBilling = (grants: Grants[]) => {
    const subjectRoleFilters = grants
        .map((grant) => `catalog_name.ilike.${grant.object_role}%`)
        .join(',');

    return supabaseClient
        .from<CatalogStats>(TABLES.CATALOG_STATS)
        .select(
            `    
            catalog_name,
            grain,
            ts,
            bytes_written_by_me,
            bytes_read_by_me,
            flow_document
        `
        )
        .eq('grain', 'monthly')
        .or(subjectRoleFilters)
        .order('ts');
};

export { getStatsForBilling, getStatsByName };
