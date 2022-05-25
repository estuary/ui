import { SWRConfiguration } from 'swr';
import { OpenGraph } from 'types';

export const stripPathing = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

// TODO (i18n) should support trying to grab correct locale
export const getConnectorName = (connectorObject: OpenGraph) => {
    return connectorObject['en-US'].title;
};

export const getConnectorIcon = (connectorObject: OpenGraph) => {
    return connectorObject['en-US'].image;
};

export type DeploymentStatus = 'ACTIVE' | 'INACTIVE';
export const getDeploymentStatusHexCode = (
    deploymentStatus: DeploymentStatus
): string => {
    switch (deploymentStatus) {
        case 'ACTIVE':
            return '#40B763';
        case 'INACTIVE':
            return '#C9393E';
        default:
            return '#F7F7F7';
    }
};

export const getPathWithParam = (path: string, param: any, val: any) => {
    return `${path}?${param}=${val}`;
};

export const getSWRConfig = (enablePolling?: boolean) => {
    const options: SWRConfiguration | undefined = enablePolling
        ? {
              refreshInterval: 500,
          }
        : undefined;

    return options;
};
