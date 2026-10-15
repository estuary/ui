import { Box, Grid } from '@mui/material';

import HeroDetail from 'src/components/home/hero/Detail';
import WelcomeImage from 'src/components/home/hero/Images/Welcome';

function HeroImageAndDescription() {
    return (
        <Box sx={{ mx: 'auto', pb: 3, maxWidth: 1000, p: 2 }}>
            <Grid
                size={{ xs: 12 }}
                sx={{
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <WelcomeImage />
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <HeroDetail />
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
