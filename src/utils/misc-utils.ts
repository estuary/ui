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
