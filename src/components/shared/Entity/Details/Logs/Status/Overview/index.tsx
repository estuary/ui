import { Grid } from '@mui/material';

import ConnectorOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview//ConnectorOverview';
import AutoDiscoveryOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview/AutoDiscoveryOverview';
import ControllerOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerOverview';
import { useEntityType } from 'src/context/EntityContext';

export default function Overview() {
    const entityType = useEntityType();

    return (
        <Grid container spacing={1}>
            {entityType === 'collection' ? null : <ConnectorOverview />}
            <ControllerOverview />
            {entityType === 'capture' ? <AutoDiscoveryOverview /> : null}
        </Grid>
    );
}
