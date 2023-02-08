import { Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
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
        <Box sx={{ mx: 'auto', maxWidth: 1000 }}>
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
                                <FormattedMessage id="home.hero.companyOverview.description" />
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
                                How it works
                            </Button>
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid item xs={4}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mb: 1.5,
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        backgroundColor: (theme) =>
                                            theme.palette.secondary.main,
                                        fontSize: 16,
                                    }}
                                >
                                    1
                                </Avatar>

                                <Typography variant="h6">
                                    <FormattedMessage id="terms.capture" />
                                </Typography>
                            </Stack>

                            <Typography variant="subtitle1">
                                <FormattedMessage id="home.hero.companyDetails.step1" />
                            </Typography>
                        </Grid>

                        <Grid
                            item
                            xs={4}
                            sx={{
                                display: 'flex',
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
                                    <FormattedMessage id="capturesTable.cta.new" />
                                </Button>
                            </NavLink>
                        </Grid>

                        <Grid item xs={4}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mb: 1.5,
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        backgroundColor: (theme) =>
                                            theme.palette.secondary.main,
                                        fontSize: 16,
                                    }}
                                >
                                    2
                                </Avatar>

                                <Typography variant="h6">
                                    <FormattedMessage id="terms.materialization" />
                                </Typography>
                            </Stack>

                            <Typography variant="subtitle1">
                                <FormattedMessage id="home.hero.companyDetails.step2" />
                            </Typography>
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
}

export default HeroImageAndDescription;
