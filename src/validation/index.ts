import { PrefixedName_Errors } from 'components/inputs/PrefixedName/types';
import { hasLength } from 'utils/misc-utils';

// Based on pattern taken from
//  https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
export const PREFIX_NAME_PATTERN = `[a-zA-Z0-9-_.]+`;
export const CATALOG_NAME_PATTERN = `^(${PREFIX_NAME_PATTERN}/)+${PREFIX_NAME_PATTERN}$`;
export const NAME_RE = new RegExp(CATALOG_NAME_PATTERN);

export const NUMERIC_RE = RegExp(`^[0-9]+$`);
export const POSTGRES_INTERVAL_RE = new RegExp(`^[0-9]{2}:[0-9]{2}:[0-9]{2}$`);
export const CAPTURE_INTERVAL_RE = new RegExp(`^[0-9]+(s|m|h)$`);

// Based on the patterns connectors use for date time
// eslint-disable-next-line no-useless-escape
export const DATE_TIME_RE = new RegExp(
    /^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z)$/
);

export const MAC_ADDR_RE = new RegExp(/^([0-9A-F]{2}:){7}([0-9A-F]{2})$/i);

export const validateCatalogName = (
    value: string,
    allowBlank?: boolean,
    allowEndSlash?: boolean
): PrefixedName_Errors => {
    const isBlank = !hasLength(value);

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
