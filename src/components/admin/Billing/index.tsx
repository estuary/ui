import { Divider, Grid, Typography } from '@mui/material';
import { BillingRecord, getBillingHistory } from 'api/billing';
import { authenticatedRoutes } from 'app/routes';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import DataByMonthGraph from 'components/admin/Billing/graphs/DataByMonthGraph';
import DataByTaskGraph from 'components/admin/Billing/graphs/DataByTaskGraph';
import GraphStateWrapper from 'components/admin/Billing/graphs/states/Wrapper';
import TasksByMonth from 'components/admin/Billing/graphs/TasksByMonthGraph';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import TenantOptions from 'components/admin/Billing/TenantOptions';
import AdminTabs from 'components/admin/Tabs';
import AlertBox from 'components/shared/AlertBox';
import BillingHistoryTable from 'components/tables/Billing';
import { eachMonthOfInterval, format, startOfMonth, subMonths } from 'date-fns';
import useBillingCatalogStats from 'hooks/billing/useBillingCatalogStats';
import useBillingRecord from 'hooks/billing/useBillingRecord';
import usePageTitle from 'hooks/usePageTitle';
import { isArray, isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_billingHistoryInitialized,
    useBilling_hydrated,
    useBilling_resetState,
    useBilling_selectedTenant,
    useBilling_setBillingHistory,
    useBilling_setBillingHistoryInitialized,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
    useBilling_updateBillingHistory,
} from 'stores/Billing/hooks';
import useConstant from 'use-constant';

const routeTitle = authenticatedRoutes.admin.billing.title;

function AdminBilling() {
    // Billing Store
    const hydrated = useBilling_hydrated();
    const setHydrated = useBilling_setHydrated();
    const setHydrationErrorsExist = useBilling_setHydrationErrorsExist();

    const historyInitialized = useBilling_billingHistoryInitialized();
    const setHistoryInitialized = useBilling_setBillingHistoryInitialized();
    const setBillingHistory = useBilling_setBillingHistory();
    const updateBillingHistory = useBilling_updateBillingHistory();

    const selectedTenant = useBilling_selectedTenant();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();

    const resetBillingState = useBilling_resetState();

    const currentMonth = useConstant(() => {
        const today = new Date();

        return startOfMonth(today);
    });

    const dateRange = useMemo(() => {
        const startMonth = startOfMonth(subMonths(currentMonth, 5));

        return eachMonthOfInterval({
            start: startMonth,
            end: currentMonth,
        }).map((date) => format(date, "yyyy-MM-dd' 00:00:00+00'"));
    }, [currentMonth]);

    const {
        billingStats,
        error: billingStatsError,
        isValidating: isValidatingStats,
    } = useBillingCatalogStats();

    const { billingRecord, isValidating: isValidatingRecord } =
        useBillingRecord(currentMonth);

    useEffect(() => {
        if (
            selectedTenant &&
            dateRange.length > 0 &&
            !hydrated &&
            !historyInitialized
        ) {
            getBillingHistory(selectedTenant, dateRange)
                .then(
                    (responses) => {
                        const data: BillingRecord[] = [];

                        responses.forEach((response) => {
                            if (response.error) {
                                throw new Error(response.error.message);
                            }

                            if (response.data.max_concurrent_tasks > 0) {
                                data.push(response.data);
                            }
                        });

                        setBillingHistory(data);
                    },
                    () => {
                        setHydrationErrorsExist(true);
                        setHydrated(true);
                    }
                )
                .finally(() => setHistoryInitialized(true));
        }
    }, [
        setBillingHistory,
        setHistoryInitialized,
        setHydrated,
        setHydrationErrorsExist,
        dateRange,
        historyInitialized,
        hydrated,
        selectedTenant,
    ]);

    useEffect(() => {
        if (!isValidatingStats && billingStats) {
            setDataByTaskGraphDetails(billingStats);

            if (!hydrated) {
                setHydrated(true);
            }
        }

        if (billingStatsError) {
            setHydrationErrorsExist(true);
            setHydrated(true);
        }
    }, [
        setDataByTaskGraphDetails,
        setHydrated,
        setHydrationErrorsExist,
        billingStats,
        billingStatsError,
        hydrated,
        isValidatingStats,
    ]);

    useEffect(() => {
        if (
            historyInitialized &&
            !isValidatingRecord &&
            !isEmpty(billingRecord)
        ) {
            updateBillingHistory(
                isArray(billingRecord) ? billingRecord : [billingRecord]
            );
        }
    }, [
        updateBillingHistory,
        billingRecord,
        historyInitialized,
        isValidatingRecord,
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
                        <BillingHistoryTable />
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper messageId="admin.billing.graph.dataByMonth.header">
                        <GraphStateWrapper>
                            <DataByMonthGraph />
                        </GraphStateWrapper>
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper messageId="admin.billing.graph.tasksByMonth.header">
                        <GraphStateWrapper>
                            <TasksByMonth />
                        </GraphStateWrapper>
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper
                        messageId="admin.billing.graph.dataByTask.header"
                        tooltipMessageId="admin.billing.graph.dataByTask.tooltip"
                    >
                        <GraphStateWrapper>
                            <DataByTaskGraph />
                        </GraphStateWrapper>
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
                                    <FormattedMessage id="admin.billing.paymentMethods.header" />
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
