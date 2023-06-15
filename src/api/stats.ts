import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    endOfWeek,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { CatalogStats, CatalogStats_Billing } from 'types';

export type StatsFilter =
    | 'today'
    | 'yesterday'
    | 'lastWeek'
    | 'thisWeek'
    | 'lastMonth'
    | 'thisMonth';

// This will format the date so that it just gets the month, day, year
//  We do not need the full minute/hour/offset because the backend is not saving those
export const formatToGMT = (date: any) =>
    formatInTimeZone(date, 'GMT', "yyyy-MM-dd' 00:00:00+00'");

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
    const yesterday = subDays(today, 1);
    const lastWeek = subWeeks(today, 1);
    const lastMonth = subMonths(today, 1);

    switch (filter) {
        // Day Range
        case 'today':
            queryBuilder = queryBuilder
                .eq('ts', formatToGMT(today))
                .eq('grain', 'daily');
            break;
        case 'yesterday':
            queryBuilder = queryBuilder
                .eq('ts', formatToGMT(yesterday))
                .eq('grain', 'daily');
            break;

        // Week Range
        case 'thisWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToGMT(startOfWeek(today)))
                .lt('ts', formatToGMT(endOfWeek(today)))
                .eq('grain', 'daily');
            break;
        case 'lastWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToGMT(startOfWeek(lastWeek)))
                .lt('ts', formatToGMT(endOfWeek(lastWeek)))
                .eq('grain', 'daily');
            break;

        // Month Range
        case 'thisMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatToGMT(startOfMonth(today)))
                .eq('grain', 'monthly');

            break;
        case 'lastMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatToGMT(startOfMonth(lastMonth)))
                .eq('grain', 'monthly');
            break;

        default:
            throw new Error('Unsupported filter used in Stats Query');
    }

    return queryBuilder.then(handleSuccess<CatalogStats[]>, handleFailure);
};

const getStatsForBilling = (tenants: string[], startDate: string) => {
    const subjectRoleFilters = tenants
        .map((tenant) => `catalog_name.ilike.${tenant}%`)
        .join(',');

    const today = new Date();

    return supabaseClient
        .from<CatalogStats_Billing>(TABLES.CATALOG_STATS)
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
        .gte('ts', formatToGMT(startDate))
        .lte('ts', formatToGMT(today))
        .or(subjectRoleFilters)
        .order('ts', { ascending: false });
};

// TODO (billing): Enable pagination when a database table containing historic billing data is available.
//   This function is temporarily unused since the billing history table component is using filtered data
//   returned by the billing_report RPC to populate the contents of its rows.
const getStatsForBillingHistoryTable = (
    tenants: string[],
    // pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
): PostgrestFilterBuilder<CatalogStats_Billing> => {
    const subjectRoleFilters = tenants
        .map((tenant) => `catalog_name.ilike.${tenant}%`)
        .join(',');

    const today = new Date();
    const currentMonth = startOfMonth(today);
    const startMonth = subMonths(currentMonth, 5);

    let queryBuilder = supabaseClient
        .from<CatalogStats_Billing>(TABLES.CATALOG_STATS)
        .select(
            `    
            catalog_name,
            grain,
            ts,
            bytes_written_by_me,
            bytes_read_by_me,
            flow_document
        `,
            { count: 'exact' }
        )
        .eq('grain', 'monthly')
        .gte('ts', formatToGMT(startMonth))
        .lte('ts', formatToGMT(today))
        .or(subjectRoleFilters);

    queryBuilder = defaultTableFilter<CatalogStats_Billing>(
        queryBuilder,
        ['ts'],
        searchQuery,
        sorting
        // pagination
    );

    return queryBuilder;
};

export { getStatsByName, getStatsForBilling, getStatsForBillingHistoryTable };
