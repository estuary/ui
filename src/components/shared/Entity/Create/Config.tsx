import type { EntityCreateConfigProps } from 'src/components/shared/Entity/Create/types';

import { useEffect } from 'react';

import { Collapse, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ConnectorGrid from 'src/components/connectors/Grid';
import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

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
