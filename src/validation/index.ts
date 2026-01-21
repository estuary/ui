import type { PrefixedName_Errors } from 'src/components/inputs/PrefixedName/types';

// Based on pattern taken from
//  https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
export const PREFIX_NAME_PATTERN = `[a-zA-Z0-9-_.]+`;
export const CATALOG_NAME_PATTERN = `^(${PREFIX_NAME_PATTERN}/)+${PREFIX_NAME_PATTERN}$`;
export const NAME_RE = new RegExp(CATALOG_NAME_PATTERN);

export const NUMERIC_RE = RegExp(`^[0-9]+$`);
export const POSTGRES_INTERVAL_RE = new RegExp(`^[0-9]{2}:[0-9]{2}:[0-9]{2}$`);
export const DURATION_RE = new RegExp(/^[0-9]+(h|m|s){1}$/);
export const CAPTURE_INTERVAL_RE = new RegExp(
    /^([0-9]+day(s\b|\b))? ?([0-9]+h)? ?([0-9]+m)? ?([0-9]+s)?$/
);
export const ISO_8601_DURATION_RE = new RegExp(
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
);
export const ISO_8601_DURATION_RE_STRING = ISO_8601_DURATION_RE.toString();
// Need the pattern with the slashes removed for JSON Forms. Passing a pattern string in was not working as
// the escaped characters kept getting removed
export const ISO_8601_DURATION_PATTERN = ISO_8601_DURATION_RE_STRING.substring(
    1,
    ISO_8601_DURATION_RE_STRING.length - 1
);

// Based on the patterns connectors use for date time
// eslint-disable-next-line no-useless-escape
export const DATE_TIME_RE = new RegExp(
    /^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z)$/
);

export const MAC_ADDR_RE = new RegExp(/^([0-9A-F]{2}:){7}([0-9A-F]{2})$/i);

export const UNDERSCORE_RE = new RegExp(/_+/g);

export const validateCatalogName = (
    value: string,
    allowBlank?: boolean,
    allowEndSlash?: boolean
): PrefixedName_Errors => {
    const isBlank = !Boolean(value && value.length > 0);

    // See if this field is allowed to be blank
    if (!allowBlank && isBlank) {
        return ['missing'];
    }

    // Check if ending slash - otherwise the regex below would throw an error
    if (!isBlank && !allowEndSlash && value.endsWith('/')) {
        return ['endingSlash'];
    }

    // Check the name is the correct format
    const DYNAMIC_NAME_RE = new RegExp(
        `^(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}${
            allowEndSlash ? '/?' : ''
        }$`
    );
    if (!isBlank && !DYNAMIC_NAME_RE.test(value)) {
        return ['invalid'];
    }

    // TODO (naming) need to check for unclean paths
    // if (
    //     value === '.' ||
    //     value === './' ||
    //     value === '..' ||
    //     value === '../' ||
    //     UNCLEAN_PATH_RE.test(value)
    // ) {
    //     return ['unclean'];
    // }

    return null;
};
