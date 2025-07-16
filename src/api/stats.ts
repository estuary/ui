import type { PostgrestResponse } from '@supabase/postgrest-js';
import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    CatalogStats,
    CatalogStats_Dashboard,
    CatalogStats_Details,
    Entity,
} from 'src/types';

import { UTCDate } from '@date-fns/utc';
import {
    isSaturday,
    isSunday,
    nextSaturday,
    parseISO,
    previousSunday,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { DateTime } from 'luxon';
import pLimit from 'p-limit';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultQueryDateFormat,
    LUXON_GRAIN_SETTINGS,
} from 'src/services/luxon';
import { TABLES } from 'src/services/supabase';
import { CHUNK_SIZE } from 'src/utils/misc-utils';

export type StatsFilter =
    | 'today'
    | 'yesterday'
    | 'lastWeek'
    | 'thisWeek'
    | 'lastMonth'
    | 'thisMonth'
    | 'allTime';

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

const DEFAULT_COLS = [
    'bytes_written_by_me',
    'docs_written_by_me',
    'bytes_read_by_me',
    'docs_read_by_me',
    'bytes_written_to_me',
    'docs_written_to_me',
    'bytes_read_from_me',
    'docs_read_from_me',
];
const DEFAULT_QUERY = `${BASE_QUERY},${DEFAULT_COLS.join(',')}`;

const DASHBOARD_QUERY = `${BASE_QUERY},bytes_written_by_me,bytes_read_by_me`;

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
export type Grains =
    | typeof hourlyGrain
    | typeof dailyGrain
    | typeof monthlyGrain;
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
            .from(TABLES.CATALOG_STATS)
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

            case 'allTime':
                queryBuilder = queryBuilder.eq('grain', monthlyGrain);
                break;

            default:
                throw new Error('Unsupported filter used in Stats Query');
        }

        return queryBuilder.returns<CatalogStats[]>();
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

const getStatsForDetails = (
    catalogName: string,
    entityType: Entity,
    range: DataByHourRange
) => {
    const rangeSettings = LUXON_GRAIN_SETTINGS[range.grain];
    const current = DateTime.utc().startOf(rangeSettings.timeUnit);
    const past = current.minus({
        [rangeSettings.relativeUnit]: range.amount - 1,
    });

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
        .from(TABLES.CATALOG_STATS)
        .select(query)
        .eq('catalog_name', catalogName)
        .eq('grain', range.grain)
        .gte('ts', past.toFormat(defaultQueryDateFormat))
        .lte('ts', current.toFormat(defaultQueryDateFormat))
        .order('ts', { ascending: true })
        .returns<CatalogStats_Details[]>();
};

const getStatsForDashboard = (tenant: string) => {
    return supabaseClient
        .from(TABLES.CATALOG_STATS)
        .select(`${DASHBOARD_QUERY}`)
        .eq('catalog_name', `${tenant}`)
        .eq('grain', 'monthly')
        .eq('ts', DateTime.utc().startOf('month'))
        .order('ts', { ascending: true })
        .returns<CatalogStats_Dashboard[]>();
};

// TODO (billing): Enable pagination when a database table containing historic billing data is available.
//   This function is temporarily unused since the billing history table component is using filtered data
//   returned by the billing_report RPC to populate the contents of its rows.

// SBV2-typing (PostgrestFilterBuilder<CatalogStats_Billing>)
// const getStatsForBillingHistoryTable = (
//     tenants: string[],
//     // pagination: any,
//     searchQuery: any,
//     sorting: SortingProps<any>[]
// ) => {
//     // switched this query to use `like` but never tested so might require `ilike` but that impacts perf (Q2 2024)
//     const subjectRoleFilters = tenants
//         .map(
//             (tenant) => `catalog_name.like.${escapeReservedCharacters(tenant)}%`
//         )
//         .join(',');

//     const today = new Date();
//     const currentMonth = startOfMonth(today);
//     const startMonth = subMonths(currentMonth, 5);

//     const query = supabaseClient
//         .from(TABLES.CATALOG_STATS)
//         .select(
//             `
//             catalog_name,
//             grain,
//             ts,
//             bytes_written_by_me,
//             bytes_read_by_me,
//             flow_document
//         `,
//             { count: 'exact' }
//         )
//         .eq('grain', monthlyGrain)
//         .gte('ts', convertToUTC(startMonth, monthlyGrain))
//         .lte('ts', convertToUTC(today, monthlyGrain))
//         .or(subjectRoleFilters);

//     return defaultTableFilter<typeof query>(
//         query,
//         ['ts'],
//         searchQuery,
//         sorting
//     );
// };

export { getStatsByName, getStatsForDashboard, getStatsForDetails };
