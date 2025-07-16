import { Box, Divider, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import RecordingConsentModal from 'src/components/admin/Legal/RecordingConsentModal';
import AdminTabs from 'src/components/admin/Tabs';
import ExternalLink from 'src/components/shared/ExternalLink';
import { truncateTextSx } from 'src/context/Theme';
import usePageTitle from 'src/hooks/usePageTitle';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { getUrls } from 'src/utils/env-utils';

const urls = getUrls();

function AdminLegal() {
    usePageTitle({
        header: authenticatedRoutes.admin.legal.title,
    });

    const intl = useIntl();

    return (
        <>
            <AdminTabs />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Settings
                    </Typography>

                    <Typography>
                        Below you can see the legal documents and change consent
                        settings at any time.
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <OutlinedChip
                            // color={sourceCapture ? 'success' : 'info'}
                            color="success"
                            label={
                                <Box
                                    sx={{
                                        ...truncateTextSx,
                                        minWidth: 100,
                                        p: 1,
                                    }}
                                >
                                    Recording Enabled
                                </Box>
                            }
                            onDelete={async () => {
                                console.log('call server to remove');
                            }}
                            style={{
                                maxWidth: '50%',
                                minHeight: 40,
                            }}
                            variant="outlined"
                        />
                        <RecordingConsentModal />
                    </Stack>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Links
                    </Typography>

                    <Stack
                        spacing={1}
                        sx={{
                            alignItems: 'start',
                            maxWidth: 'fit-content',
                        }}
                    >
                        <ExternalLink link={urls.termsOfService}>
                            {intl.formatMessage({ id: 'legal.docs.terms' })}
                        </ExternalLink>
                        <ExternalLink link={urls.privacyPolicy}>
                            {intl.formatMessage({ id: 'legal.docs.privacy' })}
                        </ExternalLink>
                        <ExternalLink link={urls.license}>
                            {intl.formatMessage({ id: 'legal.docs.license' })}
                        </ExternalLink>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}

export default AdminLegal;
