import { OpenGraph } from 'types';

export const stripPathing = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

export const getConnectorIcon = (connectorObject: OpenGraph) => {
    return connectorObject['en-US'].image;
};

export const getPathWithParam = (path: string, param: any, val: any) => {
    return `${path}?${param}=${val}`;
};

// TODO: Replace instances of getPathWithParam with the expanded utility function below.
export const getPathWithParams = (
    baseURL: string,
    params: { [key: string]: string }
): string => {
    let url = `${baseURL}?`;

    Object.entries(params).forEach(([key, value], index) => {
        url = url.concat(index === 0 ? `${key}=${value}` : `&${key}=${value}`);
    });

    return url;
};

export const hasLength = (val: string | any[] | null | undefined) => {
    return val && val.length > 0;
};

export const base64RemovePadding = (state: string | null) => {
    return state ? state.replace(/[=]{1,2}$/, '') : state;
};
