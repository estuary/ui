export const stripPathing = (stringVal: string) => {
    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

// TODO (typing) ConnectorTag or Connector should work here.
export const getConnectorName = (
    connectorObject: any,
    defaultToTag?: boolean
) => {
    if (connectorObject.title) {
        return connectorObject.title;
    }
    if (connectorObject.connector_tags) {
        if (connectorObject.connector_tags[0]?.title) {
            return connectorObject.connector_tags[0].title;
        }
    }
    if (connectorObject.detail) {
        return connectorObject.detail;
    }
    if (connectorObject.connectors?.detail) {
        return connectorObject.connectors.detail;
    }
    if (connectorObject.image_name) {
        return stripPathing(connectorObject.image_name);
    }

    if (defaultToTag === true) {
        if (connectorObject.image_tag) {
            return stripPathing(connectorObject.image_tag);
        }
        throw new Error('Could not figure out Connector Name');
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
