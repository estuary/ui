import {
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    Stack,
    Switch,
    Typography,
} from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import AlertBox from 'src/components/shared/AlertBox';
import usePageTitle from 'src/hooks/usePageTitle';

function AdminLegal() {
    usePageTitle({
        header: authenticatedRoutes.admin.support.title,
    });

    return (
        <>
            <AdminTabs />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Enhanced Support
                    </Typography>

                    <Typography>
                        Enhanced support provides priority support with
                        Estuary’s technical team. This enables them to see your
                        data.
                    </Typography>

                    <AlertBox
                        title="We need to show more legal verbiage here if we directly allow them to enable"
                        short
                        severity="info"
                    />

                    <Stack>
                        <FormControl>
                            <FormControlLabel
                                control={<Switch size="small" checked />}
                                label={
                                    <Box>
                                        Enhanced Support Enabled | Expires: June
                                        00, 0000{' '}
                                        <Button variant="text">edit</Button>
                                    </Box>
                                }
                            />
                        </FormControl>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Session Recording
                    </Typography>

                    <Typography>
                        With your consent, our support team can securely view
                        dashboard activity to resolve issues faster—no sensitive
                        info is shared, and your privacy is protected.
                    </Typography>

                    <AlertBox
                        title="We need to show more legal verbiage here if we directly allow them to enable"
                        short
                        severity="info"
                    />

                    <Stack>
                        <FormControl>
                            <FormControlLabel
                                control={<Switch size="small" checked />}
                                label={
                                    <Box>
                                        Session Recording Enabled | Expires:
                                        June 00, 0000{' '}
                                        <Button variant="text">edit</Button>
                                    </Box>
                                }
                            />
                        </FormControl>
                    </Stack>

                    {/*<Stack direction="row" spacing={2}>
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
                                    Enhanced Support Enabled (ex: 2025-00-00)
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
                                    Recording Enabled (ex: 2025-00-00)
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
                    </Stack>*/}
                </Grid>
            </Grid>

            <Divider sx={{ mt: 1, mb: 2 }} />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Delete My Recordings
                    </Typography>

                    <Typography>
                        At anytime you may delete all session recordings that
                        are stored. They will always auto-delete after 1 month.
                    </Typography>

                    <Stack
                        spacing={1}
                        sx={{
                            alignItems: 'start',
                            maxWidth: 'fit-content',
                        }}
                    >
                        <Button>Request Recording Deletion</Button>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}

export default AdminLegal;
