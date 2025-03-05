import { Collapse, Typography } from '@mui/material';
import ConnectorGrid from 'components/connectors/Grid';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { EntityCreateConfigProps } from './types';

function EntityCreateConfig({
    condensed,
    entityType,
}: EntityCreateConfigProps) {
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

            <ConnectorGrid condensed={condensed} protocolPreset={entityType} />
        </Collapse>
    );
}

export default EntityCreateConfig;
