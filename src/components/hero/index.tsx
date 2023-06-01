import { Box, Grid } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import useDirectiveGuard from 'app/guards/hooks';
import MessageWithButton from 'components/content/MessageWithButton';
import HeroTabs from 'components/hero/Tabs';
import AlertBox from 'components/shared/AlertBox';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { jobStatusPoller } from 'services/supabase';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';
import HeroDemo from './Demo';
import HeroDetail from './Detail';
import { useHeroTabs } from './hooks';
import DemoImage from './Images/Demo';
import WelcomeImage from './Images/Welcome';
import HeroOverview from './Overview';

const directiveName = 'acceptDemoTenant';

function HeroImageAndDescription() {
    const { activeTab } = useHeroTabs();

    const { directive, status, mutate } = useDirectiveGuard(directiveName, {
        hideAlert: true,
    });

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const [serverError, setServerError] = useState<string | null>(null);

    const applyDirective = async (): Promise<void> => {
        if (directive) {
            const response = await submitDirective(
                directiveName,
                directive,
                objectRoles[0]
            );

            if (response.error) {
                return setServerError(
                    (response.error as PostgrestError).message
                );
            }

            const data = response.data[0];

            jobStatusPoller(
                jobStatusQuery(data),
                async () => {
                    trackEvent(`${directiveName}:Complete`, directive);

                    setServerError(null);

                    void mutate();
                },
                async (payload: any) => {
                    trackEvent(`${directiveName}:Error`, directive);

                    setServerError(payload.job_status.error);
                }
            );
        }
    };

    return (
        <Box sx={{ mx: 'auto', pb: 3, maxWidth: 1000 }}>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={12}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <HeroTabs />
                </Grid>

                {activeTab === 'demo' &&
                hasLength(objectRoles) &&
                status !== null &&
                status !== 'fulfilled' ? (
                    <>
                        {serverError ? (
                            <Grid item xs={12}>
                                <AlertBox short severity="error">
                                    <MessageWithButton
                                        messageId="home.hero.demo.alert.demoTenant"
                                        clickHandler={applyDirective}
                                    />
                                </AlertBox>
                            </Grid>
                        ) : null}

                        <Grid item xs={12} sx={{ pb: 2 }}>
                            <AlertBox
                                short
                                severity="info"
                                title={
                                    <FormattedMessage id="home.hero.demo.alert.demoTenant.header" />
                                }
                            >
                                <MessageWithButton
                                    messageId="home.hero.demo.alert.demoTenant"
                                    clickHandler={applyDirective}
                                />
                            </AlertBox>
                        </Grid>
                    </>
                ) : null}

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
