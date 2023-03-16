import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import useConstant from 'use-constant';

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

function AdminBilling() {
    useBrowserTitle('browserTitle.admin.billing');

    const intl = useIntl();

    const pricingTiers = useConstant(() => [
        intl.formatMessage({ id: 'admin.billing.tier.free' }),
        intl.formatMessage({ id: 'admin.billing.tier.personal' }),
        intl.formatMessage({ id: 'admin.billing.tier.enterprise' }),
    ]);

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.billing.title,
                headerLink: 'https://www.estuary.dev/pricing/',
            }}
        >
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Stack>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                            <FormattedMessage id="admin.billing.header" />
                        </Typography>

                        <Typography>
                            <FormattedMessage id="admin.billing.message" />
                        </Typography>
                    </Stack>
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <Autocomplete
                        options={pricingTiers}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    sx: { borderRadius: 3 },
                                }}
                                label={intl.formatMessage({
                                    id: 'admin.billing.label.tiers',
                                })}
                                variant="outlined"
                                size="small"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'admin.billing.tier.free',
                        })}
                        disableClearable
                        sx={{ flexGrow: 1 }}
                        // onChange={changeHandler}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 200,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <span>Projected Cost by Month</span>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 200,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <span>Data by Month</span>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 200,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <span>Connectors by Month</span>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 200,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <span>Data by Task</span>
                    </Box>
                </Grid>
            </Grid>
        </PageContainer>
    );
}

export default AdminBilling;
