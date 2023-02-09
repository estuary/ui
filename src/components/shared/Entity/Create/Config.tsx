import { Box, CircularProgress, Collapse, Typography } from '@mui/material';
import ConnectorTiles from 'components/ConnectorTiles';
import ExistingEntityCards from 'components/shared/Entity/ExistingEntityCards';
import {
    useExistingEntity_connectorName,
    useExistingEntity_createNewTask,
    useExistingEntity_hydrated,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { EntityWithCreateWorkflow } from 'types';

interface Props {
    title: string;
    entityType: EntityWithCreateWorkflow;
}

function EntityCreateConfig({ title, entityType }: Props) {
    useBrowserTitle(title);

    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const navigateToCreate = useEntityCreateNavigate();

    // Existing Entity Store
    const existingEntityStoreHydrated = useExistingEntity_hydrated();
    const createNewTask = useExistingEntity_createNewTask();
    const connectorName = useExistingEntity_connectorName();

    const [showConnectorTiles, setShowConnectorTiles] = useState<
        boolean | null
    >(null);

    useEffect(() => {
        if (typeof connectorId === 'string') {
            setShowConnectorTiles(false);
        } else {
            setShowConnectorTiles(true);
        }
    }, [connectorId]);

    useEffect(() => {
        if (existingEntityStoreHydrated && connectorId && createNewTask) {
            navigateToCreate(entityType, connectorId, true, true);
        }
    }, [
        navigateToCreate,
        connectorId,
        createNewTask,
        entityType,
        existingEntityStoreHydrated,
    ]);

    if (showConnectorTiles === null) return null;
    return (
        <>
            <Collapse in={showConnectorTiles} unmountOnExit>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="entityCreate.instructions" />
                </Typography>

                <ConnectorTiles protocolPreset={entityType} replaceOnNavigate />
            </Collapse>

            <Collapse in={!showConnectorTiles} unmountOnExit>
                {existingEntityStoreHydrated ? (
                    <>
                        <Typography sx={{ mb: 2 }}>
                            <FormattedMessage
                                id="existingEntityCheck.instructions"
                                values={{ entityType, connectorName }}
                            />
                        </Typography>

                        <Typography sx={{ mb: 3 }}>
                            <FormattedMessage
                                id="existingEntityCheck.instructions2"
                                values={{ entityType, connectorName }}
                            />
                        </Typography>

                        <ExistingEntityCards />
                    </>
                ) : (
                    <Box
                        sx={{
                            height: 500,
                            borderRadius: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 1,
                        }}
                    >
                        <CircularProgress />

                        <Typography sx={{ ml: 2 }}>
                            <FormattedMessage id="common.loading" />
                        </Typography>
                    </Box>
                )}
            </Collapse>
        </>
    );
}

export default EntityCreateConfig;
