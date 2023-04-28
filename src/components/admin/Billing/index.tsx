import { Divider, Grid, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import DataByMonthGraph from 'components/admin/Billing/graphs/DataByMonthGraph';
import DataByTaskGraph from 'components/admin/Billing/graphs/DataByTaskGraph';
import TasksByMonth from 'components/admin/Billing/graphs/TasksByMonthGraph';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import TenantOptions from 'components/admin/Billing/TenantOptions';
import AdminTabs from 'components/admin/Tabs';
import AlertBox from 'components/shared/AlertBox';
import BillingHistoryTable from 'components/tables/Billing';
import useBillingCatalogStats from 'hooks/billing/useBillingCatalogStats';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import usePageTitle from 'hooks/usePageTitle';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_hydrated,
    useBilling_resetState,
    useBilling_setBillingHistory,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
    useBilling_setTenants,
} from 'stores/Billing/hooks';
import './graphs/graph.css';

const routeTitle = authenticatedRoutes.admin.billing.title;

function AdminBilling() {
    // Billing Store
    const hydrated = useBilling_hydrated();
    const setHydrated = useBilling_setHydrated();
    const setHydrationErrorsExist = useBilling_setHydrationErrorsExist();

    const setTenants = useBilling_setTenants();

    const setBillingHistory = useBilling_setBillingHistory();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();

    const resetBillingState = useBilling_resetState();

    const { combinedGrants, isValidating: isValidatingGrants } =
        useCombinedGrantsExt({ adminOnly: true });

    const {
        billingStats,
        error,
        isValidating: isValidatingStats,
    } = useBillingCatalogStats();

    useEffect(() => {
        if (!isValidatingGrants) {
            setTenants(combinedGrants);
        }
    }, [setTenants, combinedGrants, isValidatingGrants]);

    useEffect(() => {
        if (!isValidatingStats && billingStats) {
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
        isValidatingStats,
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
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="admin.billing.header" />
                    </Typography>

                    <PricingTierDetails />
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <TenantOptions />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={6}>
                    <CardWrapper messageId="admin.billing.table.history.header">
                        {combinedGrants.length > 0 ? (
                            <BillingHistoryTable />
                        ) : null}
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper messageId="admin.billing.graph.dataByMonth.header">
                        <DataByMonthGraph />
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper messageId="admin.billing.graph.tasksByMonth.header">
                        <TasksByMonth />
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper
                        messageId="admin.billing.graph.dataByTask.header"
                        tooltipMessageId="admin.billing.graph.dataByTask.tooltip"
                    >
                        <DataByTaskGraph />
                    </CardWrapper>
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
