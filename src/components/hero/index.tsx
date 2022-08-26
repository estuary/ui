import { Box, Grid } from '@mui/material';
import Description from 'components/hero/Description';
import WelcomeImage from 'components/hero/WelcomeImage';

function HeroImageAndDescription() {
    return (
        <Box sx={{ mx: 'auto', maxWidth: 1000 }}>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={12}
                    sx={{
                        alignContent: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <WelcomeImage />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Description
                    step="one"
                    sx={{
                        maxWidth: 300,
                    }}
                />
                <Description
                    step="two"
                    sx={{
                        mx: 'auto',
                        maxWidth: 225,
                    }}
                />
                <Description
                    step="three"
                    sx={{
                        ml: 'auto',
                        maxWidth: 300,
                    }}
                />
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
