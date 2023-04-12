import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import DataByMonthGraph from 'components/admin/Billing/graphs/DataByMonthGraph';
import DataByTaskGraph from 'components/admin/Billing/graphs/DataByTaskGraph';
import TasksByMonth from 'components/admin/Billing/graphs/TasksByMonthGraph';
import AdminTabs from 'components/admin/Tabs';
import MessageWithLink from 'components/content/MessageWithLink';
import PageContainer from 'components/shared/PageContainer';
import ProjectedCostsTable from 'components/tables/Billing';
import useProjectCostStats from 'components/tables/Billing/useProjectedCostStats';
import { semiTransparentBackground } from 'context/Theme';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import {
    useBilling_resetState,
    useBilling_setBillingDetails,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setProjectedCostStats,
} from 'stores/Tables/Billing/hooks';
import useConstant from 'use-constant';
import { TOTAL_CARD_HEIGHT } from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

const typographySx = { mb: 2, fontSize: 16, fontWeight: 300 };

function AdminBilling() {
    useBrowserTitle('browserTitle.admin.billing');

    const intl = useIntl();

    const pricingTiers = useConstant(() => [
        intl.formatMessage({ id: 'admin.billing.tier.personal' }),
        intl.formatMessage({ id: 'admin.billing.tier.enterprise' }),
    ]);

    // Billing Store
    const setProjectedCostStats = useBilling_setProjectedCostStats();
    const setBillingDetails = useBilling_setBillingDetails();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();
    const resetBillingState = useBilling_resetState();

    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { projectedCostStats: projectedCostStatsData } = useProjectCostStats(
        {}
    );

    useEffect(() => {
        if (hasLength(projectedCostStatsData)) {
            setProjectedCostStats(projectedCostStatsData);
            setBillingDetails();
            setDataByTaskGraphDetails(projectedCostStatsData);
        }
    }, [
        setBillingDetails,
        setDataByTaskGraphDetails,
        setProjectedCostStats,
        projectedCostStatsData,
    ]);

    useUnmount(() => resetBillingState());

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
                            id: 'admin.billing.tier.personal',
                        })}
                        disableClearable
                        sx={{ flexGrow: 1 }}
                        // onChange={changeHandler}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background: (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.projectedCostTable.header" />
                        </Typography>

                        {combinedGrants.length > 0 ? (
                            <ProjectedCostsTable grants={combinedGrants} />
                        ) : null}

                        {/* <ProjectedCostsTable /> */}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background: (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.dataByMonth.header" />
                        </Typography>

                        <DataByMonthGraph />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background: (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.connectorsByMonth.header" />
                        </Typography>

                        <TasksByMonth />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background: (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.dataByTask.header" />
                        </Typography>

                        <DataByTaskGraph />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ mt: 3, mb: 2 }} />

                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="admin.billing.payment.header" />
                    </Typography>

                    <MessageWithLink messageID="admin.billing.payment.message" />
                </Grid>
            </Grid>
        </PageContainer>
    );
}

export default AdminBilling;
