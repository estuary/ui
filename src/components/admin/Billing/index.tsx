import { Divider, Grid, Typography } from '@mui/material';
import { BillingRecord, getBillingHistory, getManualBills } from 'api/billing';
import { authenticatedRoutes } from 'app/routes';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ManualBillBanner from 'components/admin/Billing/ManualBillBanner';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import TenantOptions from 'components/admin/Billing/TenantOptions';
import AdminTabs from 'components/admin/Tabs';
import UsageByMonthGraph from 'components/graphs/UsageByMonthGraph';
import GraphStateWrapper from 'components/graphs/states/Wrapper';
import AlertBox from 'components/shared/AlertBox';
import BillingLineItemsTable from 'components/tables/BillLineItems';
import BillingHistoryTable from 'components/tables/Billing';
import { eachMonthOfInterval, format, startOfMonth, subMonths } from 'date-fns';
import useBillingCatalogStats from 'hooks/billing/useBillingCatalogStats';
import useBillingRecord from 'hooks/billing/useBillingRecord';
import usePageTitle from 'hooks/usePageTitle';
import { isArray, isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_billingHistoryInitialized,
    useBilling_hydrated,
    useBilling_manualBills,
    useBilling_resetState,
    useBilling_selectedMonth,
    useBilling_selectedTenant,
    useBilling_setBillingHistory,
    useBilling_setBillingHistoryInitialized,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
    useBilling_setManualBills,
    useBilling_updateBillingHistory,
} from 'stores/Billing/hooks';
import useConstant from 'use-constant';
import { TOTAL_CARD_HEIGHT, stripTimeFromDate } from 'utils/billing-utils';

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

    const manualBills = useBilling_manualBills();
    const setManualBills = useBilling_setManualBills();

    const selectedTenant = useBilling_selectedTenant();
    const selectedMonth = useBilling_selectedMonth();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();

    const resetBillingState = useBilling_resetState();

    const intl = useIntl();

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
            Promise.all([
                getManualBills(selectedTenant, new Date()).then((bills) => {
                    if (bills.body) {
                        setManualBills(bills.body);
                    }
                }),
                getBillingHistory(selectedTenant, dateRange).then(
                    (responses) => {
                        const data: BillingRecord[] = [];

                        responses.forEach((response) => {
                            if (response.error) {
                                throw new Error(response.error.message);
                            }

                            if (
                                typeof response.data.task_usage_hours ===
                                    'number' &&
                                typeof response.data.processed_data_gb ===
                                    'number'
                            ) {
                                data.push(response.data);
                            }
                        });

                        setBillingHistory(data);
                    },
                    () => {
                        setHydrationErrorsExist(true);
                        setHydrated(true);
                    }
                ),
            ]).finally(() => setHistoryInitialized(true));
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
        setManualBills,
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
                <Grid item xs={12}>
                    {manualBills.map((bill) => (
                        <ManualBillBanner key={bill.description} bill={bill} />
                    ))}
                </Grid>
                <Grid item xs={12} md={6}>
                    <CardWrapper
                        height={TOTAL_CARD_HEIGHT}
                        message={
                            <FormattedMessage id="admin.billing.table.history.header" />
                        }
                    >
                        <BillingHistoryTable />
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <CardWrapper
                        height={TOTAL_CARD_HEIGHT}
                        message={
                            <FormattedMessage id="admin.billing.graph.usageByMonth.header" />
                        }
                    >
                        <GraphStateWrapper>
                            <UsageByMonthGraph />
                        </GraphStateWrapper>
                    </CardWrapper>
                </Grid>

                <Grid item xs={12} md={12}>
                    <CardWrapper
                        height={TOTAL_CARD_HEIGHT}
                        message={
                            <FormattedMessage
                                id="admin.billing.label.lineItems"
                                values={{
                                    b: (chunks) => <strong>{chunks}</strong>,
                                    month:
                                        selectedMonth.length > 0
                                            ? intl.formatDate(
                                                  stripTimeFromDate(
                                                      selectedMonth
                                                  ),
                                                  {
                                                      year: 'numeric',
                                                      month: 'long',
                                                  }
                                              )
                                            : '...',
                                }}
                            />
                        }
                    >
                        {/* The key here makes sure that any stateful fetching logic doesn't get confused. */}
                        <BillingLineItemsTable key={selectedMonth} />
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
