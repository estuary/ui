import { Collapse, Typography } from '@mui/material';
import ConnectorTiles from 'components/connectors/ConnectorTiles';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import type { EntityWithCreateWorkflow } from 'types';

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
