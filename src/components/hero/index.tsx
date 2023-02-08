import { Box, Button, Grid, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import Step from 'components/hero/Step';
import HeroTabs, { tabProps } from 'components/hero/Tabs';
import WelcomeImage from 'components/hero/WelcomeImage';
import { NavArrowRight, Plus } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

function HeroImageAndDescription() {
    const [activeTab, setActiveTab] = useState<number>(0);

    const switchToDetailsTab = () => {
        setActiveTab(1);
    };

    return (
        <Box sx={{ mx: 'auto', pb: 3, maxWidth: 1000 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <HeroTabs
                        selectedTab={activeTab}
                        setSelectedTab={setActiveTab}
                    />
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
                {tabProps[activeTab].value === 'overview' ? (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" align="center">
                                <FormattedMessage
                                    id="home.hero.companyOverview.description"
                                    values={{
                                        b: (companyName) => (
                                            <b>{companyName}</b>
                                        ),
                                    }}
                                />
                            </Typography>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                endIcon={
                                    <NavArrowRight style={{ fontSize: 14 }} />
                                }
                                onClick={switchToDetailsTab}
                                sx={{ minWidth: 160 }}
                            >
                                <FormattedMessage id="home.hero.companyOverview.cta" />
                            </Button>
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid item xs={4}>
                            <Step stepNumber={1} entityType="capture" />
                        </Grid>

                        <Grid
                            item
                            xs={4}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <NavLink
                                style={{ textDecoration: 'none' }}
                                to={
                                    authenticatedRoutes.captures.create.fullPath
                                }
                            >
                                <Button
                                    startIcon={
                                        <Plus style={{ fontSize: 14 }} />
                                    }
                                    sx={{ minWidth: 160 }}
                                >
                                    <FormattedMessage id="home.hero.companyDetails.cta" />
                                </Button>
                            </NavLink>
                        </Grid>

                        <Grid item xs={4}>
                            <Step stepNumber={2} entityType="materialization" />
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
