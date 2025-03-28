import { useEffect } from 'react';

import { Collapse, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ConnectorTiles from 'src/components/connectors/ConnectorTiles';
import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import type { EntityWithCreateWorkflow } from 'src/types';

interface Props {
    entityType: EntityWithCreateWorkflow;
}

function EntityCreateConfig({ entityType }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const navigateToCreate = useEntityCreateNavigate();

    useEffect(() => {
        if (connectorId) {
            navigateToCreate(entityType, {
                id: connectorId,
                advanceToForm: true,
            });
        }
    }, [navigateToCreate, connectorId, entityType]);

    return (
        <Collapse in={!connectorId} unmountOnExit>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="entityCreate.instructions" />
            </Typography>

            <ConnectorTiles protocolPreset={entityType} />
        </Collapse>
    );
}

export default EntityCreateConfig;
