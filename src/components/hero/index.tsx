import { Box, Grid } from '@mui/material';
import HeroTabs from 'components/hero/Tabs';
import WelcomeImage from 'components/hero/WelcomeImage';
import HeroExplanation from './Explanation';
import { useHeroTabs } from './hooks';
import HeroOverview from './Overview';

function HeroImageAndDescription() {
    const { activeTab, tabs } = useHeroTabs();

    return (
        <Box sx={{ mx: 'auto', pb: 3, maxWidth: 1000 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <HeroTabs />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sx={{
                        display: 'flex',
                        alignContent: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <WelcomeImage />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {tabs[activeTab].value === 'overview' ? (
                    <HeroOverview />
                ) : (
                    <HeroExplanation />
                )}
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
