import type { PostgrestResponse } from '@supabase/postgrest-js';
import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    BindingStatsResponse,
    CatalogStats,
    CatalogStats_Backlog,
    CatalogStats_Dashboard,
    CatalogStats_Details,
    CatalogStats_LastPublished,
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

// Per-binding readings live in the stats document rather than in dedicated
// columns, so anything below binding granularity has to come out of the JSON.
const STATS_DOCUMENT_QUERY = `${BASE_QUERY},flow_document`;

const hourlyGrain = 'hourly';
const dailyGrain = 'daily';
const monthlyGrain = 'monthly';
type Grains = typeof hourlyGrain | typeof dailyGrain | typeof monthlyGrain;
type AllowedDates = Date | string | number;

// Make sure that this matched the derivation closely
//      Function : grainsFromTS
//      Source : https://github.com/estuary/flow/blob/master/ops-catalog/catalog-stats.ts
// TODO (typing)
const convertToUTC = (
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

/**
 * The `ts` bounds of a range, formatted for a `catalog_stats` query.
 *
 * Shared so that two queries covering "the same window" cannot compute it
 * differently — the bindings table's figures have to line up with the chart's.
 */
const getRangeBounds = (range: DataByHourRange) => {
    const rangeSettings = LUXON_GRAIN_SETTINGS[range.grain];
    const current = DateTime.utc().startOf(rangeSettings.timeUnit);
    const past = current.minus({
        [rangeSettings.relativeUnit]: range.amount - 1,
    });

    return {
        current: current.toFormat(defaultQueryDateFormat),
        past: past.toFormat(defaultQueryDateFormat),
    };
};

const getStatsForDetails = (
    catalogName: string,
    entityType: Entity,
    range: DataByHourRange
) => {
    const { current, past } = getRangeBounds(range);

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
        .gte('ts', past)
        .lte('ts', current)
        .order('ts', { ascending: true })
        .returns<CatalogStats_Details[]>();
};

// `bytesBehind` is a gauge describing where a materialization stands right now,
// so the newest reading is the only one worth showing, and hourly is the finest
// grain available.
//
// A few rows are fetched rather than just the newest, because a row carries no
// binding stats at all when a usage heartbeat opened the hour — see
// `newestBindingStats`, which picks the newest row that does.
const BACKLOG_HOURS = 6;

const getMaterializationBacklog = (catalogName: string) => {
    return supabaseClient
        .from(TABLES.CATALOG_STATS)
        .select(STATS_DOCUMENT_QUERY)
        .eq('catalog_name', catalogName)
        .eq('grain', hourlyGrain)
        .order('ts', { ascending: false })
        .limit(BACKLOG_HOURS)
        .returns<CatalogStats_Backlog[]>();
};

// Where each of a materialization's source collections has been written up to,
// which pairs with the task's own `lastSourcePublishedAt` to say how far behind
// it is in time. `lastPublishedAt` reduces by maximizing, so a month's row
// already holds the latest publication within that month; two months of rows
// place the frontier of any collection still being written to.
const getCollectionsLastPublished = (collectionNames: string[]) => {
    const previousMonth = DateTime.utc().startOf('month').minus({ months: 1 });

    return supabaseClient
        .from(TABLES.CATALOG_STATS)
        .select(STATS_DOCUMENT_QUERY)
        .in('catalog_name', collectionNames)
        .eq('grain', monthlyGrain)
        .gte('ts', previousMonth.toFormat(defaultQueryDateFormat))
        .returns<CatalogStats_LastPublished[]>();
};

// Per-binding stats live only inside `flow_document` — `catalog_stats` is keyed
// (catalog_name, grain, ts) with no per-binding column. The breakdown is attached
// to task rows (not tenant-prefix rows) by `taskStats` in
// https://github.com/estuary/flow/blob/master/ops-catalog/catalog-stats.ts
//
// Shares `getRangeBounds` with `getStatsForDetails`, so the bindings table and
// the usage chart above it cover exactly the same window. Callers sum
// `taskStats` across the returned rows.
//
// Only the `taskStats` subtree is selected, never the whole document: the
// breakdown carries an entry per binding on every row, so a wide range on a task
// with a thousand bindings is megabytes even after PostgREST has narrowed it.
// That is why the volume columns render a loading state on a range change rather
// than assuming the response is instant.
const getBindingStats = (catalogName: string, range: DataByHourRange) => {
    const { current, past } = getRangeBounds(range);

    return supabaseClient
        .from(TABLES.CATALOG_STATS)
        .select(`catalog_name,grain,ts,taskStats:flow_document->taskStats`)
        .eq('catalog_name', catalogName)
        .eq('grain', range.grain)
        .gte('ts', past)
        .lte('ts', current)
        .order('ts', { ascending: true })
        .returns<BindingStatsResponse[]>();
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

export {
    getBindingStats,
    getCollectionsLastPublished,
    getMaterializationBacklog,
    getStatsByName,
    getStatsForDashboard,
    getStatsForDetails,
};
