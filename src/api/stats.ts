import {
    endOfWeek,
    format,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
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

// We want to grab the ISO String so that the time already
//  has the offset we want. Then we convert it to a date object
// and force that to be GMT to keep the timezone and offset correctly
const getCurrentGMTDate = () => {
    return utcToZonedTime(new Date().toISOString(), 'Etc/GMT');
};

// This will format the date so that it just gets the month, day, year, and hour
//  We do not need the full minute/house/offset because the backend is not saving those
export const formatDateToString = (date: Date, includeHour?: boolean) => {
    const formattedDate = format(
        date,
        `yyyy-MM-dd' ${includeHour ? "'HH'" : '00'}:00:00+00'`
    );

    console.log(`${date} has become ${formattedDate}`);

    return formattedDate;
};

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

    const today = getCurrentGMTDate();
    const yesterday = subDays(today, 1);
    const lastWeek = subWeeks(today, 1);
    const lastMonth = subMonths(today, 1);

    switch (filter) {
        // Day Range
        case 'today':
            queryBuilder = queryBuilder
                .eq('ts', formatDateToString(today))
                .eq('grain', 'daily');
            break;
        case 'yesterday':
            queryBuilder = queryBuilder
                .eq('ts', formatDateToString(yesterday))
                .eq('grain', 'daily');
            break;

        // Week Range
        case 'thisWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatDateToString(startOfWeek(today)))
                .lte('ts', formatDateToString(endOfWeek(today)))
                .eq('grain', 'daily');
            break;
        case 'lastWeek':
            queryBuilder = queryBuilder
                .gte('ts', formatDateToString(startOfWeek(lastWeek)))
                .lte('ts', formatDateToString(endOfWeek(lastWeek)))
                .eq('grain', 'daily');
            break;

        // Month Range
        case 'thisMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatDateToString(startOfMonth(today)))
                .eq('grain', 'monthly');

            break;
        case 'lastMonth':
            queryBuilder = queryBuilder
                .eq('ts', formatDateToString(startOfMonth(lastMonth)))
                .eq('grain', 'monthly');
            break;

        default:
            throw new Error('Unsupported filter used in Stats Query');
    }

    return queryBuilder.then(handleSuccess<CatalogStats[]>, handleFailure);
};

export { getStatsByName };
