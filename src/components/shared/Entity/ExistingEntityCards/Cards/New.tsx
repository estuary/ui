import { Box, Typography } from '@mui/material';
import EntityCardWrapper from 'components/shared/Entity/ExistingEntityCards/Cards/Wrapper';
import { useExistingEntity_connectorName } from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { useEntityType } from 'context/EntityContext';
import { alternateConnectorImageBackgroundSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Plus } from 'iconoir-react';
import LogRocket from 'logrocket';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { DEFAULT_FILTER } from 'services/supabase';
import { EntityWithCreateWorkflow } from 'types';

const trackEvent = (
    entityType: EntityWithCreateWorkflow,
    connectorId?: string
) => {
    const logEvent: CustomEvents =
        entityType === 'capture'
            ? CustomEvents.CAPTURE_CREATE_CONFIG_CREATE
            : CustomEvents.MATERIALIZATION_CREATE_CONFIG_CREATE;

    LogRocket.track(logEvent, {
        connector_id: connectorId ?? DEFAULT_FILTER,
    });
};

function NewEntityCard() {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const navigateToCreate = useEntityCreateNavigate();

    const entityType = useEntityType();

    // Existing Entity Store
    const connectorName = useExistingEntity_connectorName();

    const createNewTask = () => {
        if (entityType === 'capture' || entityType === 'materialization') {
            trackEvent(entityType, connectorId);

            navigateToCreate(entityType, connectorId, false, true);
        }
    };

    return (
        <EntityCardWrapper clickHandler={createNewTask}>
            <Box
                sx={{
                    ...alternateConnectorImageBackgroundSx,
                    width: 51,
                }}
            >
                <Plus style={{ fontSize: 24 }} />
            </Box>

            <Box sx={{ ml: 2 }}>
                <Typography sx={{ width: 'max-content' }}>
                    <FormattedMessage
                        id="existingEntityCheck.newCard.label"
                        values={{ connectorName, entityType }}
                    />
                </Typography>
            </Box>
        </EntityCardWrapper>
    );
}

export default NewEntityCard;
