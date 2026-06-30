import { Box, Grid } from '@mui/material';

import HeroDemo from 'src/components/home/hero/Demo';
import HeroDetail from 'src/components/home/hero/Detail';
import { useHeroTabs } from 'src/components/home/hero/hooks';
import DemoImage from 'src/components/home/hero/Images/Demo';
import WelcomeImage from 'src/components/home/hero/Images/Welcome';
import HeroOverview from 'src/components/home/hero/Overview';
import HeroTabs from 'src/components/home/hero/Tabs';

function HeroImageAndDescription() {
    const { activeTab } = useHeroTabs();

    return (
        <Box sx={{ mx: 'auto', pb: 3, maxWidth: 1000, p: 2 }}>
            <Grid container spacing={2}>
                <Grid
                    size={{ xs: 12 }}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <HeroTabs />
                </Grid>

                <Grid
                    size={{ xs: 12 }}
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
