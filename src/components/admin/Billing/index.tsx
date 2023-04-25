import {
    Box,
    Divider,
    Grid,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import DataByMonthGraph from 'components/admin/Billing/graphs/DataByMonthGraph';
import DataByTaskGraph from 'components/admin/Billing/graphs/DataByTaskGraph';
import TasksByMonth from 'components/admin/Billing/graphs/TasksByMonthGraph';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import AdminTabs from 'components/admin/Tabs';
import AlertBox from 'components/shared/AlertBox';
import BillingHistoryTable from 'components/tables/Billing';
import { semiTransparentBackground } from 'context/Theme';
import useBillingCatalogStats from 'hooks/billing/useBillingCatalogStats';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import usePageTitle from 'hooks/usePageTitle';
import { HelpCircle } from 'iconoir-react';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_hydrated,
    useBilling_resetState,
    useBilling_setBillingHistory,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
} from 'stores/Billing/hooks';
import { TOTAL_CARD_HEIGHT } from 'utils/billing-utils';

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

const typographySx = { mb: 2, fontSize: 16, fontWeight: 300 };

const routeTitle = authenticatedRoutes.admin.billing.title;

function AdminBilling() {
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

    const intl = useIntl();

    // Billing Store
    const hydrated = useBilling_hydrated();
    const setHydrated = useBilling_setHydrated();
    const setHydrationErrorsExist = useBilling_setHydrationErrorsExist();

    const setBillingHistory = useBilling_setBillingHistory();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();

    const resetBillingState = useBilling_resetState();

    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { billingStats, error, isValidating } = useBillingCatalogStats();

    useEffect(() => {
        if (!isValidating && billingStats) {
            setBillingHistory(billingStats);
            setDataByTaskGraphDetails(billingStats);

            if (!hydrated) {
                setHydrated(true);
            }
        }

        if (error) {
            setHydrationErrorsExist(true);
            setHydrated(true);
        }
    }, [
        setBillingHistory,
        setDataByTaskGraphDetails,
        setHydrated,
        setHydrationErrorsExist,
        billingStats,
        error,
        hydrated,
        isValidating,
    ]);

    useUnmount(() => resetBillingState());

    usePageTitle({
        header: routeTitle,
        headerLink: 'https://www.estuary.dev/pricing/',
    });

    return (
        <>
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="admin.billing.header" />
                    </Typography>

                    <PricingTierDetails />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background:
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.table.history.header" />
                        </Typography>

                        {combinedGrants.length > 0 ? (
                            <BillingHistoryTable grants={combinedGrants} />
                        ) : null}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            height: TOTAL_CARD_HEIGHT,
                            p: 2,
                            background:
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
                            background:
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
                            background:
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            borderRadius: 3,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                        >
                            <Typography sx={typographySx}>
                                <FormattedMessage id="admin.billing.graph.dataByTask.header" />
                            </Typography>

                            <Tooltip
                                placement={belowLg ? 'bottom' : 'right'}
                                title={intl.formatMessage({
                                    id: 'admin.billing.graph.dataByTask.tooltip',
                                })}
                            >
                                <HelpCircle
                                    style={{
                                        marginBottom: 16,
                                        fontSize: 12,
                                        strokeWidth: 1,
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </Tooltip>
                        </Stack>

                        <DataByTaskGraph />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ mt: 3 }} />
                </Grid>

                <Grid item xs={12}>
                    <ErrorBoundary
                        fallback={
                            <>
                                <Typography
                                    sx={{
                                        mb: 1,
                                        fontSize: 18,
                                        fontWeight: '400',
                                    }}
                                >
                                    <FormattedMessage id="admin.billing.payment_methods.header" />
                                </Typography>
                                <AlertBox short severity="error">
                                    <Typography component="div">
                                        <FormattedMessage id="admin.billing.error.paymentMethodsError" />
                                    </Typography>
                                </AlertBox>
                            </>
                        }
                        onError={(errorLoadingPaymentMethods) => {
                            logRocketEvent(
                                CustomEvents.ERROR_BOUNDARY_PAYMENT_METHODS,
                                {
                                    stack: errorLoadingPaymentMethods.stack,
                                }
                            );
                        }}
                    >
                        <PaymentMethods />
                    </ErrorBoundary>
                </Grid>
            </Grid>
        </>
    );
}

export default AdminBilling;
