import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    endOfWeek,
    format,
    startOfHour,
    startOfMonth,
    startOfWeek,
    sub,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import {
    CatalogStats,
    CatalogStats_Billing,
    CatalogStats_Details,
    Entity,
} from 'types';

export type StatsFilter =
    | 'today'
    | 'yesterday'
    | 'lastWeek'
    | 'thisWeek'
    | 'lastMonth'
    | 'thisMonth';

export interface DefaultStats {
    catalog_name: string;
    grain: string;
    ts: string;
    bytes_written_by_me: number;
    docs_written_by_me: number;
    bytes_read_by_me: number;
    docs_read_by_me: number;
    bytes_written_to_me: number;
    docs_written_to_me: number;
    bytes_read_from_me: number;
    docs_read_from_me: number;
}

const BASE_QUERY = `
            catalog_name,
            grain,
            ts
`;

const DEFAULT_QUERY = `    
            ${BASE_QUERY},
            bytes_written_by_me,
            docs_written_by_me,
            bytes_read_by_me,
            docs_read_by_me,
            bytes_written_to_me,
            docs_written_to_me,
            bytes_read_from_me,
            docs_read_from_me
        `;

// Queries just for details panel
const CAPTURE_QUERY = `
    ${BASE_QUERY},
    docs_by:docs_written_by_me,
    bytes_by:bytes_written_by_me
`;

const COLLECTION_QUERY = `
    ${BASE_QUERY},
    bytes_by:bytes_written_by_me,
    docs_by:docs_written_by_me,
    bytes_to:bytes_written_to_me,
    docs_to:docs_written_to_me
`;

const MATERIALIZATION_QUERY = `
    ${BASE_QUERY},
    docs_by:docs_read_by_me,
    bytes_by:bytes_read_by_me
`;

type AllowedDates = Date | string | number;

// This will format the date so that it just gets the month, day, year
//  We do not need the full minute/hour/offset because the backend is not saving those
export const formatToUTC = (date: AllowedDates, includeHour?: boolean) =>
    format(
        new UTCDate(date),
        `yyyy-MM-dd${includeHour ? ' HH:00:00' : "' 00:00:00+00'"}`
    );

// TODO (stats) add support for which stats columns each entity wants
//  Right now all tables run the same query even though they only need
//  2 - 4 columns. However, not a huge deal perf wise because the other cols
//  are all 0.
const getStatsByName = (names: string[], filter?: StatsFilter) => {
    let queryBuilder = supabaseClient
        .from<CatalogStats>(TABLES.CATALOG_STATS)
        .select(DEFAULT_QUERY)
        .in('catalog_name', names)
        .order('catalog_name');

    const today = new UTCDate();
    const yesterday = subDays(today, 1);
    const lastWeek = subWeeks(today, 1);
    const lastMonth = subMonths(today, 1);

    switch (filter) {
        // Day Range
        case 'today':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(today))
                .eq('grain', 'daily');
            break;
        case 'yesterday':
            queryBuilder = queryBuilder
                .eq('ts', formatToUTC(yesterday))
                .eq('grain', 'daily');
            break;

        // Week Range
        case 'thisWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToUTC(startOfWeek(today)))
                .lt('ts', formatToUTC(endOfWeek(today)))
                .eq('grain', 'daily');
            break;
        case 'lastWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatToUTC(startOfWeek(lastWeek)))
                .lt('ts', formatToUTC(endOfWeek(lastWeek)))
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

const getStatsForBilling = (tenants: string[], startDate: AllowedDates) => {
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
        .gte('ts', formatToUTC(startDate))
        .lte('ts', formatToUTC(today))
        .or(subjectRoleFilters)
        .order('ts', { ascending: false });
};

const getStatsForDetails = (
    catalogName: string,
    entityType: Entity,
    grain: string,
    duration?: Duration
) => {
    const current = new UTCDate();
    const past = duration ? sub(current, duration) : current;

    const gt = formatToUTC(startOfHour(past), true);
    const lte = formatToUTC(startOfHour(current), true);

    let query: string;
    switch (entityType) {
        case 'capture':
            query = CAPTURE_QUERY;
            break;
        case 'materialization':
            query = MATERIALIZATION_QUERY;
            break;
        case 'collection':
            query = COLLECTION_QUERY;
            break;
        default:
            query = DEFAULT_QUERY;
    }

    return supabaseClient
        .from<CatalogStats_Details>(TABLES.CATALOG_STATS)
        .select(query)
        .eq('catalog_name', catalogName)
        .eq('grain', grain)
        .gt('ts', gt)
        .lte('ts', lte)
        .order('ts', { ascending: true });
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
        .gte('ts', formatToUTC(startMonth))
        .lte('ts', formatToUTC(today))
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

export {
    getStatsByName,
    getStatsForBilling,
    getStatsForBillingHistoryTable,
    getStatsForDetails,
};
