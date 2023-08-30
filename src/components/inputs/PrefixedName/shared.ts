import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { PrefixedName_Errors } from './types';

export const validateCatalogName = (
    value: string,
    allowBlank?: boolean,
    allowEndSlash?: boolean
): PrefixedName_Errors => {
    const isBlank = !hasLength(value);

    // See iff this field is allowed to be blank
    if (!allowBlank && isBlank) {
        return ['missing'];
    }

    // Check if ending slash - otherwise the regex below would throw an error
    if (!isBlank && !allowEndSlash && value.endsWith('/')) {
        return ['endingSlash'];
    }

    // Check the name is the correct format
    const NAME_RE = new RegExp(
        `^(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}${
            allowEndSlash ? '/?' : ''
        }$`
    );
    if (!isBlank && !NAME_RE.test(value)) {
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
