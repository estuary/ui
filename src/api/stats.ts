import {
    PostgrestFilterBuilder,
    PostgrestResponse,
} from '@supabase/postgrest-js';
import {
    Duration,
    isSaturday,
    isSunday,
    nextSaturday,
    parseISO,
    previousSunday,
    startOfMonth,
    sub,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import {
    defaultTableFilter,
    escapeReservedCharacters,
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
import pLimit from 'p-limit';
import { CHUNK_SIZE } from 'utils/misc-utils';

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
    docs_written:docs_written_by_me,
    bytes_written:bytes_written_by_me
`;

const COLLECTION_QUERY = `
    ${BASE_QUERY},
    bytes_read:bytes_read_from_me,
    docs_read:docs_read_from_me,
    bytes_written:bytes_written_to_me,
    docs_written:docs_written_to_me
`;

const MATERIALIZATION_QUERY = `
    ${BASE_QUERY},
    docs_read:docs_read_by_me,
    bytes_read:bytes_read_by_me
`;

const hourlyGrain = 'hourly';
const dailyGrain = 'daily';
const monthlyGrain = 'monthly';
type Grains = typeof hourlyGrain | typeof dailyGrain | typeof monthlyGrain;
type AllowedDates = Date | string | number;

// Make sure that this matched the derivation closely
//      Function : grainsFromTS
//      Source : https://github.com/estuary/flow/blob/master/ops-catalog/catalog-stats.ts
// TODO (typing)
export const convertToUTC = (
    date: AllowedDates,
    grain: Grains,
    skipConversion?: boolean
): any => {
    const isoUTC = new UTCDate(
        typeof date === 'string' ? parseISO(date) : date
    );

    isoUTC.setUTCMilliseconds(0);
    isoUTC.setUTCSeconds(0);
    isoUTC.setUTCMinutes(0);

    if (grain === dailyGrain) {
        isoUTC.setUTCHours(0);
    }

    if (grain === monthlyGrain) {
        isoUTC.setUTCHours(0);
        isoUTC.setUTCDate(1);
    }

    return skipConversion ? isoUTC : isoUTC.toISOString();
};

// TODO (stats) add support for which stats columns each entity wants
//  Right now all tables run the same query even though they only need
//  2 - 4 columns. However, not a huge deal perf wise because the other cols
//  are all 0.
const getStatsByName = async (names: string[], filter?: StatsFilter) => {
    const limiter = pLimit(3);
    const promises: Array<Promise<PostgrestResponse<CatalogStats>>> = [];
    let index = 0;

    // TODO (retry) promise generator
    const promiseGenerator = (idx: number) => {
        let queryBuilder = supabaseClient
            .from<CatalogStats>(TABLES.CATALOG_STATS)
            .select(DEFAULT_QUERY)
            .in('catalog_name', names.slice(idx, idx + CHUNK_SIZE))
            .order('catalog_name');

        const today = new Date();

        // TODO (locale) allow users to have proper locale settings used for start and end of weeks
        // startOf/endOf functions can give some odd results so just forcing exactly
        //  what days we want to say are the start and end of a week based on the
        //  current day.
        const weekStart = isSunday(today) ? today : previousSunday(today);
        const weekEnd = isSaturday(today) ? today : nextSaturday(today);

        switch (filter) {
            // Day Range
            case 'today':
                queryBuilder = queryBuilder
                    .eq('ts', convertToUTC(today, dailyGrain))
                    .eq('grain', dailyGrain);
                break;
            case 'yesterday':
                queryBuilder = queryBuilder
                    .eq('ts', convertToUTC(subDays(today, 1), dailyGrain))
                    .eq('grain', dailyGrain);
                break;

            // Week Range
            case 'thisWeek':
                queryBuilder = queryBuilder
                    .gte('ts', convertToUTC(weekStart, dailyGrain))
                    .lte('ts', convertToUTC(weekEnd, dailyGrain))
                    .eq('grain', dailyGrain);
                break;
            case 'lastWeek':
                queryBuilder = queryBuilder
                    .gte('ts', convertToUTC(subWeeks(weekStart, 1), dailyGrain))
                    .lte('ts', convertToUTC(subWeeks(weekEnd, 1), dailyGrain))
                    .eq('grain', dailyGrain);
                break;

            // Month Range
            case 'thisMonth':
                queryBuilder = queryBuilder
                    .eq('ts', convertToUTC(today, monthlyGrain))
                    .eq('grain', monthlyGrain);

                break;
            case 'lastMonth':
                queryBuilder = queryBuilder
                    .eq('ts', convertToUTC(subMonths(today, 1), monthlyGrain))
                    .eq('grain', monthlyGrain);
                break;

            default:
                throw new Error('Unsupported filter used in Stats Query');
        }

        return queryBuilder;
    };

    // This could probably be written in a fancy functional-programming way with
    // clever calls to concat and map and slice and stuff,
    // but I want it to be dead obvious what's happening here.
    while (index < names.length) {
        // Have to do this to capture `index` correctly
        const prom = promiseGenerator(index);
        promises.push(limiter(() => prom));

        index = index + CHUNK_SIZE;
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => r.error);
    return errors[0] ?? { data: response.flatMap((r) => r.data) };
};

const getStatsForBilling = (tenants: string[], startDate: AllowedDates) => {
    const subjectRoleFilters = tenants
        .map(
            (tenant) =>
                `catalog_name.ilike.${escapeReservedCharacters(tenant)}%`
        )
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
        .eq('grain', monthlyGrain)
        .gte('ts', convertToUTC(startDate, monthlyGrain))
        .lte('ts', convertToUTC(today, monthlyGrain))
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

    const gt = convertToUTC(past, hourlyGrain);
    const lte = convertToUTC(current, hourlyGrain);

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
        .map(
            (tenant) =>
                `catalog_name.ilike.${escapeReservedCharacters(tenant)}%`
        )
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
        .eq('grain', monthlyGrain)
        .gte('ts', convertToUTC(startMonth, monthlyGrain))
        .lte('ts', convertToUTC(today, monthlyGrain))
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
