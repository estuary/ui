import type { EntityCreateConfigProps } from 'src/components/shared/Entity/Create/types';

import { useEffect } from 'react';

import { Collapse, Typography } from '@mui/material';

import ConnectorGrid from 'src/components/connectors/Grid';
import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function EntityCreateConfig({
    condensed,
    entityType,
}: EntityCreateConfigProps) {
    const connectorImagePath = useGlobalSearchParams(
        GlobalSearchParams.CONNECTOR_IMAGE_PATH
    );

    const navigateToCreate = useEntityCreateNavigate();

    useEffect(() => {
        if (connectorImagePath) {
            navigateToCreate(entityType, {
                imagePath: connectorImagePath,
                advanceToForm: true,
            });
        }
    }, [navigateToCreate, connectorImagePath, entityType]);

    return (
        <Collapse in={!connectorImagePath} unmountOnExit>
            <Typography sx={{ mb: 2 }}>
                To start select a Connector below. Once you make a selection the
                rest of the form will display and you can configure your
                endpoint. You can search by name and if you do not find what you
                are looking for please let us know by requesting the connector.
            </Typography>

            <ConnectorGrid condensed={condensed} protocolPreset={entityType} />
        </Collapse>
    );
}

export default EntityCreateConfig;
