import type { ConnectorGridProps } from 'src/components/connectors/Grid/types';

import { useState } from 'react';

import { Grid, useMediaQuery, useTheme } from '@mui/material';

import ConnectorCards from 'src/components/connectors/Grid/ConnectorCards';
import ConnectorToolbar from 'src/components/connectors/Grid/ConnectorToolbar';
import {
    CONNECTOR_GRID_COLUMNS,
    CONNECTOR_GRID_SPACING,
} from 'src/components/connectors/Grid/shared';

function ConnectorGrid({ condensed, protocolPreset }: ConnectorGridProps) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [protocol, setProtocol] = useState<string | null>(
        protocolPreset ?? null
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);

    return (
        <Grid
            container
            spacing={CONNECTOR_GRID_SPACING}
            columns={CONNECTOR_GRID_COLUMNS}
            paddingRight={2}
            margin="auto"
        >
            <Grid item xs={12}>
                <ConnectorToolbar
                    belowMd={belowMd}
                    gridSpacing={2}
                    hideProtocol={!!protocolPreset}
                    setProtocol={setProtocol}
                    setSearchQuery={setSearchQuery}
                />
            </Grid>

            <ConnectorCards
                condensed={condensed}
                protocol={protocol}
                searchQuery={searchQuery}
            />
        </Grid>
    );
}

export default ConnectorGrid;
