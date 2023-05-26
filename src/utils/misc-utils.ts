import { createSearchParams } from 'react-router-dom';

export const PREFIX_NAME_PATTERN = `[a-zA-Z0-9-_.]+`;

// TODO (optimization): Combine the stripPathing and truncateCatalogName utility functions.
export const stripPathing = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

export const stripName = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(0, stringVal.lastIndexOf('/') + 1);
};

export const hasLength = (val: string | any[] | null | undefined): boolean => {
    return Boolean(val && val.length > 0);
};

export const getPathWithParams = (
    baseURL: string,
    params: { [key: string]: string | string[] } | URLSearchParams
): string => {
    let newSearchParams;

    if (params instanceof URLSearchParams) {
        newSearchParams = params;
    } else {
        newSearchParams = createSearchParams(params);
    }

    return `${baseURL}?${newSearchParams.toString()}`;
};

export const base64RemovePadding = (state: string | null) => {
    return state ? state.replace(/[=]{1,2}$/, '') : state;
};

export const timeoutCleanUp = (pollerTimeout: number | undefined) => {
    if (pollerTimeout) {
        window.clearInterval(pollerTimeout);
    }
};

const INTERVAL_MAX = 5000;
const INTERVAL_INCREMENT = 500;
export const incrementInterval = (
    interval: number,
    max: number | undefined = INTERVAL_MAX
) => (interval < max ? interval + INTERVAL_INCREMENT : max);

export const arrayToMatrix = (arr: any[], width: number) =>
    arr.reduce(
        (rows, key, index) =>
            (index % width == 0
                ? rows.push([key])
                : rows[rows.length - 1].push(key)) && rows,
        []
    );

export const unescapeString = (stringVal: string) => {
    return stringVal.replaceAll(/\\"/g, '"');
};

// For awhile we need to support the old (pre sql) derivation key
const derivationKeys = ['derivation', 'dervie'];

type SpecContainsDerivationResponse =
    | {
          isDerivation: false;
          derivationKey: null;
      }
    | {
          isDerivation: true;
          derivationKey: string;
      };
export const specContainsDerivation = (
    spec?: any
): SpecContainsDerivationResponse => {
    let isDerivation = false;
    let derivationKey = null;

    derivationKeys.some((key) => {
        if (spec?.[key]) {
            isDerivation = true;
            derivationKey = key;
            return true;
        }

        return false;
    });

    return { isDerivation, derivationKey };
};
