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
import GraphLoadingState from 'components/graphs/states/Loading';
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
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBillingStore } from 'stores/Billing/Store';
import {
    useBilling_hydrated,
    useBilling_resetState,
    useBilling_selectedInvoice,
    useBilling_setActive,
    useBilling_setDataByTaskGraphDetails,
    useBilling_setHydrated,
    useBilling_setHydrationErrorsExist,
    useBilling_setNetworkFailed,
} from 'stores/Billing/hooks';
import { useTenantStore } from 'stores/Tenant/Store';
import useConstant from 'use-constant';
import { TOTAL_CARD_HEIGHT, invoiceId } from 'utils/billing-utils';
import { AdminBillingProps } from './types';

const routeTitle = authenticatedRoutes.admin.billing.title;

// Adding a hair of height so that a slight amount of a line item
//  is shown and hope that'll make it clear the section can scroll
const invoiceCardHeight = TOTAL_CARD_HEIGHT + 5;

function AdminBilling({ showAddPayment }: AdminBillingProps) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    // Billing Store
    const hydrated = useBilling_hydrated();
    const setHydrated = useBilling_setHydrated();
    const setHydrationErrorsExist = useBilling_setHydrationErrorsExist();

    const historyInitialized = useBillingStore(
        (state) => state.invoicesInitialized
    );
    const setHistoryInitialized = useBillingStore(
        (state) => state.setInvoicesInitialized
    );
    const setInvoices = useBillingStore((state) => state.setInvoices);
    const updateBillingHistory = useBillingStore(
        (state) => state.updateInvoices
    );
    const setActive = useBilling_setActive();
    const setNetworkFailed = useBilling_setNetworkFailed();

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
                setActive(true);
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

                    setNetworkFailed(null);
                    setInvoices(data);
                } catch (errorMessage: unknown) {
                    setNetworkFailed(`${errorMessage}`);
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
        setActive,
        setNetworkFailed,
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
                    : [currentMonthInvoices],
                selectedTenant
            );
        }
    }, [
        updateBillingHistory,
        currentMonthInvoices,
        historyInitialized,
        isValidatingRecord,
        selectedTenant,
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
                        height={invoiceCardHeight}
                        message={
                            hydrated && selectedInvoice ? (
                                <>
                                    <FormattedMessage id="admin.billing.label.lineItems" />
                                    <DateRange
                                        start_date={selectedInvoice.date_start}
                                        end_date={selectedInvoice.date_end}
                                    />
                                </>
                            ) : (
                                <FormattedMessage id="admin.billing.label.lineItems.loading" />
                            )
                        }
                    >
                        {hydrated ? (
                            <>
                                {/* The key here makes sure that any stateful fetching logic doesn't get confused. */}
                                <BillingLineItemsTable
                                    key={
                                        selectedInvoice
                                            ? invoiceId(selectedInvoice)
                                            : null
                                    }
                                />
                            </>
                        ) : (
                            <GraphLoadingState />
                        )}
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
                        <PaymentMethods showAddPayment={showAddPayment} />
                    </ErrorBoundary>
                </Grid>
            </Grid>
        </>
    );
}

export default AdminBilling;
