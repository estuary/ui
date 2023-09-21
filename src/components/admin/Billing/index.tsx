import { Divider, Grid, Typography } from '@mui/material';
import { Invoice, getInvoicesBetween } from 'api/billing';
import { authenticatedRoutes } from 'app/routes';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import DateRange from 'components/admin/Billing/DateRange';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import TenantOptions from 'components/admin/Billing/TenantOptions';
import AdminTabs from 'components/admin/Tabs';
import UsageByMonthGraph from 'components/graphs/UsageByMonthGraph';
import GraphStateWrapper from 'components/graphs/states/Wrapper';
import AlertBox from 'components/shared/AlertBox';
import BillingLineItemsTable from 'components/tables/BillLineItems';
import BillingHistoryTable from 'components/tables/Billing';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import useBillingCatalogStats from 'hooks/billing/useBillingCatalogStats';
import useInvoice from 'hooks/billing/useBillingRecord';
import usePageTitle from 'hooks/usePageTitle';
import { isArray, isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_hydrated,
    useBilling_invoicesInitialized,
    useBilling_resetState,
    useBilling_selectedInvoice,
    useBilling_selectedTenant,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
    useBilling_setInvoices,
    useBilling_setInvoicesInitialized,
    useBilling_updateInvoices,
} from 'stores/Billing/hooks';
import useConstant from 'use-constant';
import { TOTAL_CARD_HEIGHT, invoiceId } from 'utils/billing-utils';

const routeTitle = authenticatedRoutes.admin.billing.title;

function AdminBilling() {
    // Billing Store
    const hydrated = useBilling_hydrated();
    const setHydrated = useBilling_setHydrated();
    const setHydrationErrorsExist = useBilling_setHydrationErrorsExist();

    const historyInitialized = useBilling_invoicesInitialized();
    const setHistoryInitialized = useBilling_setInvoicesInitialized();
    const setInvoices = useBilling_setInvoices();
    const updateBillingHistory = useBilling_updateInvoices();

    const selectedTenant = useBilling_selectedTenant();
    const selectedInvoice = useBilling_selectedInvoice();
    const setDataByTaskGraphDetails = useBilling_setDataByTaskGraphDetails();

    const resetBillingState = useBilling_resetState();

    const currentMonth = useConstant(() => {
        const today = new Date();

        return endOfMonth(today);
    });

    const dateRange = useMemo(() => {
        const startMonth = startOfMonth(subMonths(currentMonth, 5));

        return { start: startMonth, end: currentMonth };
    }, [currentMonth]);

    const {
        billingStats,
        error: billingStatsError,
        isValidating: isValidatingStats,
    } = useBillingCatalogStats();

    const { invoices: currentMonthInvoices, isValidating: isValidatingRecord } =
        useInvoice(startOfMonth(currentMonth));

    useEffect(() => {
        if (selectedTenant && !hydrated && !historyInitialized) {
            void (async () => {
                try {
                    const response = await getInvoicesBetween(
                        selectedTenant,
                        dateRange.start,
                        dateRange.end
                    );
                    if (response.error) {
                        throw new Error(response.error.message);
                    }
                    const data: Invoice[] = [];

                    response.data.forEach((invoice) => {
                        data.push(invoice);
                    });

                    setInvoices(data);
                } catch {
                    setHydrationErrorsExist(true);
                    setHydrated(true);
                } finally {
                    setHistoryInitialized(true);
                }
            })();
        }
    }, [
        setInvoices,
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
            !isEmpty(currentMonthInvoices)
        ) {
            updateBillingHistory(
                isArray(currentMonthInvoices)
                    ? currentMonthInvoices
                    : [currentMonthInvoices]
            );
        }
    }, [
        updateBillingHistory,
        currentMonthInvoices,
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
                            <>
                                <FormattedMessage id="admin.billing.label.lineItems" />

                                {selectedInvoice ? (
                                    <DateRange
                                        start_date={selectedInvoice.date_start}
                                        end_date={selectedInvoice.date_end}
                                    />
                                ) : (
                                    ' ...'
                                )}
                            </>
                        }
                    >
                        {/* The key here makes sure that any stateful fetching logic doesn't get confused. */}
                        <BillingLineItemsTable
                            key={
                                selectedInvoice
                                    ? invoiceId(selectedInvoice)
                                    : null
                            }
                        />
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
