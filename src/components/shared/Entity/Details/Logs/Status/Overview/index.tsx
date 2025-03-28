import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { useEntityType } from 'src/context/EntityContext';
import AutoDiscoveryOverview from './AutoDiscoveryOverview';
import ControllerOverview from './ControllerOverview';

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
            <ControllerOverview />

            {entityType === 'capture' ? <AutoDiscoveryOverview /> : null}
        </Grid>
    );
}
