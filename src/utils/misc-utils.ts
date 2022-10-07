import { createSearchParams } from 'react-router-dom';

export const stripPathing = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

export const hasLength = (val: string | any[] | null | undefined): boolean => {
    return Boolean(val && val.length > 0);
};

// TODO: Replace instances of getPathWithParam with the expanded utility function below.
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

export const INTERVAL_MAX = 5000;
export const INTERVAL_INCREMENT = 500;
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
