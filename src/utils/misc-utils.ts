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
