import { Grid, useMediaQuery, useTheme } from '@mui/material';

import ConnectorOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview//ConnectorOverview';
import AutoDiscoveryOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview/AutoDiscoveryOverview';
import ControllerOverview from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerOverview';
import { useEntityType } from 'src/context/EntityContext';

const GRID_ITEM_SELECTOR = '.MuiGrid-item';

export default function Overview() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const entityType = useEntityType();

    const selector = belowMd
        ? GRID_ITEM_SELECTOR
        : `${GRID_ITEM_SELECTOR}:first-of-type`;

    return (
        <Grid
            container
            spacing={1}
            sx={{
                [selector]: {
                    pl: 0,
                },
            }}
        >
            {entityType === 'collection' ? null : <ConnectorOverview />}

            <ControllerOverview />

            {entityType === 'capture' ? <AutoDiscoveryOverview /> : null}
        </Grid>
    );
}
