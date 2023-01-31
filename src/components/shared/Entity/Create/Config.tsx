import { Collapse, Typography } from '@mui/material';
import ConnectorTiles from 'components/ConnectorTiles';
import ExistingEntityCards from 'components/shared/Entity/ExistingEntityCards';
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

    const [connectorId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
    ]);

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
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="existingEntityCheck.instructions" />
                </Typography>

                <ExistingEntityCards />
            </Collapse>
        </>
    );
}

export default EntityCreateConfig;
