import type { AdminBillingProps } from './types';
import { Divider, Grid, Typography } from '@mui/material';
import { getInvoicesBetween } from 'api/billing';
import { authenticatedRoutes } from 'app/routes';
import DateRange from 'components/admin/Billing/DateRange';
import PaymentMethods from 'components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'components/admin/Billing/PricingTierDetails';
import TenantOptions from 'components/admin/Billing/TenantOptions';
import AdminTabs from 'components/admin/Tabs';
import GraphLoadingState from 'components/graphs/states/Loading';
import GraphStateWrapper from 'components/graphs/states/Wrapper';
import UsageByMonthGraph from 'components/graphs/UsageByMonthGraph';
import AlertBox from 'components/shared/AlertBox';
import CardWrapper from 'components/shared/CardWrapper';
import BillingHistoryTable from 'components/tables/Billing';
import BillingLineItemsTable from 'components/tables/BillLineItems';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import usePageTitle from 'hooks/usePageTitle';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBilling_selectedInvoice } from 'stores/Billing/hooks';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import useConstant from 'use-constant';
import { invoiceId, TOTAL_CARD_HEIGHT } from 'utils/billing-utils';
import BillingLoadError from './LoadError';

const routeTitle = authenticatedRoutes.admin.billing.title;

// Adding a hair of height so that a slight amount of a line item
//  is shown and hope that'll make it clear the section can scroll
const invoiceCardHeight = TOTAL_CARD_HEIGHT + 5;

function AdminBilling({ showAddPayment }: AdminBillingProps) {
    usePageTitle({
        header: routeTitle,
        headerLink: 'https://www.estuary.dev/pricing/',
    });

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    // Billing Store
    // TODO (billing store)
    // The `active` stuff could probably be removed now that other stuff is
    //  cleaned up - but leaving to make it easier
    const [active, setActive] = useBillingStore((state) => [
        state.active,
        state.setActive,
    ]);
    const [hydrated, setHydrated] = useBillingStore((state) => [
        state.hydrated,
        state.setHydrated,
    ]);
    const setHydrationErrorsExist = useBillingStore(
        (state) => state.setHydrationErrorsExist
    );
    const setHistoryInitialized = useBillingStore(
        (state) => state.setInvoicesInitialized
    );
    const setInvoices = useBillingStore((state) => state.setInvoices);
    const setNetworkFailed = useBillingStore((state) => state.setNetworkFailed);

    const selectedInvoice = useBilling_selectedInvoice();

    const resetBillingState = useBillingStore((state) => state.resetState);

    const currentMonth = useConstant(() => {
        const today = new Date();

        return endOfMonth(today);
    });

    const dateRange = useMemo(() => {
        const startMonth = startOfMonth(subMonths(currentMonth, 5));

        return { start: startMonth, end: currentMonth };
    }, [currentMonth]);

    useEffect(() => {
        if (selectedTenant) {
            void (async () => {
                setNetworkFailed(null);
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
                    setNetworkFailed(null);
                    setHydrationErrorsExist(false);
                    setInvoices(response.data);
                } catch (errorMessage: unknown) {
                    setNetworkFailed(`${errorMessage}`);
                    setHydrationErrorsExist(true);
                    setInvoices([]);
                } finally {
                    setHydrated(true);
                    setHistoryInitialized(true);
                    setActive(false);
                }
            })();
        }
    }, [
        dateRange.end,
        dateRange.start,
        selectedTenant,
        setActive,
        setHistoryInitialized,
        setHydrated,
        setHydrationErrorsExist,
        setInvoices,
        setNetworkFailed,
    ]);

    useUnmount(() => resetBillingState());

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
                <BillingLoadError />

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
                            active || !hydrated ? (
                                <FormattedMessage id="admin.billing.label.lineItems.loading" />
                            ) : selectedInvoice ? (
                                <>
                                    <FormattedMessage id="admin.billing.label.lineItems" />
                                    <DateRange
                                        start_date={selectedInvoice.date_start}
                                        end_date={selectedInvoice.date_end}
                                    />
                                </>
                            ) : (
                                <FormattedMessage id="admin.billing.label.lineItems.empty" />
                            )
                        }
                    >
                        {!active && hydrated ? (
                            <BillingLineItemsTable
                                // The key here makes sure that any stateful fetching logic doesn't get confused.
                                key={
                                    selectedInvoice
                                        ? invoiceId(selectedInvoice)
                                        : null
                                }
                            />
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
