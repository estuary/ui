import type { ConnectorGridProps } from 'src/components/connectors/Grid/types';

import { useState } from 'react';

import { Grid, useMediaQuery, useTheme } from '@mui/material';

import ConnectorCards from 'src/components/connectors/Grid/ConnectorCards';
import ConnectorToolbar from 'src/components/connectors/Grid/ConnectorToolbar';

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
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 4, md: 12, lg: 12, xl: 12 }}
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
