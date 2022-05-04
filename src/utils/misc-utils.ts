import { OpenGraph } from 'types';

export const stripPathing = (stringVal: string) => {
    if (!stringVal) return stringVal;

    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

// TODO (typing) ConnectorTag or Connector should work here.
export const getConnectorName = (
    connectorObject: OpenGraph,
    fallback?: string
) => {
    if (connectorObject['en-US'].title) {
        return connectorObject['en-US'].title;
    } else {
        return fallback;
    }
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
