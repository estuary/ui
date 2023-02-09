import { Add } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useExistingEntity_connectorName } from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { useEntityType } from 'context/EntityContext';
import {
    alternateConnectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
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
        connector_tag_id: connectorId ?? DEFAULT_FILTER,
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
        <ButtonBase
            onClick={createNewTask}
            sx={{
                'width': '100%',
                'borderRadius': 5,
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                'padding': 1,
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        ...alternateConnectorImageBackgroundSx,
                        width: 51,
                    }}
                >
                    <Add />
                </Box>

                <Box sx={{ ml: 2 }}>
                    <Typography sx={{ width: 'max-content' }}>
                        <FormattedMessage
                            id="existingEntityCheck.newCard.label"
                            values={{ connectorName, entityType }}
                        />
                    </Typography>
                </Box>
            </Box>
        </ButtonBase>
    );
}

export default NewEntityCard;
