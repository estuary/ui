import { ConnectorTag } from 'components/capture/create';

export const stripPathing = (stringVal: string) => {
    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

export const getConnectorName = (connectorTag: ConnectorTag) => {
    if (connectorTag.title) return connectorTag.title;
    if (connectorTag.connectors.detail) return connectorTag.connectors.detail;
    if (connectorTag.image_tag) return stripPathing(connectorTag.image_tag);

    throw new Error('Could not figure out Connector Name');
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
