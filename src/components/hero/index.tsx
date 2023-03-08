import { Box, Grid } from '@mui/material';
import HeroTabs from 'components/hero/Tabs';
import WelcomeImage from 'components/hero/WelcomeImage';
import HeroDemo from './Demo';
import DemoImage from './DemoImage';
import HeroDetail from './Detail';
import { useHeroTabs } from './hooks';
import HeroOverview from './Overview';

function HeroImageAndDescription() {
    const { activeTab } = useHeroTabs();

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
                    {activeTab === 'demo' ? <DemoImage /> : <WelcomeImage />}
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {activeTab === 'demo' ? (
                    <HeroDemo />
                ) : activeTab === 'details' ? (
                    <HeroDetail />
                ) : (
                    <HeroOverview />
                )}
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
