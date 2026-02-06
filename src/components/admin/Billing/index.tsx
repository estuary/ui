import type { AdminBillingProps } from 'src/components/admin/Billing/types';

import { useEffect, useMemo } from 'react';
import useConstant from 'use-constant';

import { Divider, Grid, Typography } from '@mui/material';

import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import { getInvoicesBetween } from 'src/api/billing';
import { authenticatedRoutes } from 'src/app/routes';
import DateRange from 'src/components/admin/Billing/DateRange';
import BillingLoadError from 'src/components/admin/Billing/LoadError';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'src/components/admin/Billing/PricingTierDetails';
import { INVOICE_ROW_HEIGHT } from 'src/components/admin/Billing/shared';
import TenantOptions from 'src/components/admin/Billing/TenantOptions';
import AdminTabs from 'src/components/admin/Tabs';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import GraphStateWrapper from 'src/components/graphs/states/Wrapper';
import UsageByMonthGraph from 'src/components/graphs/UsageByMonthGraph';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import BillingHistoryTable from 'src/components/tables/Billing';
import BillingLineItemsTable from 'src/components/tables/BillLineItems';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBilling_selectedInvoice } from 'src/stores/Billing/hooks';
import { useBillingStore } from 'src/stores/Billing/Store';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { invoiceId, TOTAL_CARD_HEIGHT } from 'src/utils/billing-utils';

const routeTitle = authenticatedRoutes.admin.billing.title;

// Adding the height of a row generally works and should make it
//  not _too_ tall
const invoiceCardHeight = TOTAL_CARD_HEIGHT + INVOICE_ROW_HEIGHT;

function AdminBilling({ showAddPayment }: AdminBillingProps) {
    usePageTitle({
        header: routeTitle,
        headerLink: 'https://www.estuary.dev/pricing/',
    });

    const intl = useIntl();

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
                <Grid size={{ xs: 12, md: 9 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {intl.formatMessage({ id: 'admin.billing.header' })}
                    </Typography>

                    <PricingTierDetails />
                </Grid>

                <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <TenantOptions />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <BillingLoadError />

                <Grid size={{ xs: 12, md: 6 }}>
                    <CardWrapper
                        height={TOTAL_CARD_HEIGHT}
                        message={intl.formatMessage({
                            id: 'admin.billing.table.history.header',
                        })}
                    >
                        <BillingHistoryTable />
                    </CardWrapper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <CardWrapper
                        height={TOTAL_CARD_HEIGHT}
                        message={intl.formatMessage({
                            id: 'admin.billing.graph.usageByMonth.header',
                        })}
                    >
                        <GraphStateWrapper>
                            <UsageByMonthGraph />
                        </GraphStateWrapper>
                    </CardWrapper>
                </Grid>

                <Grid size={{ xs: 12, md: 12 }}>
                    <CardWrapper
                        height={invoiceCardHeight}
                        message={
                            active || !hydrated ? (
                                intl.formatMessage({
                                    id: 'admin.billing.label.lineItems.loading',
                                })
                            ) : selectedInvoice ? (
                                <>
                                    {intl.formatMessage({
                                        id: 'admin.billing.label.lineItems',
                                    })}
                                    <DateRange
                                        start_date={selectedInvoice.date_start}
                                        end_date={selectedInvoice.date_end}
                                    />
                                </>
                            ) : (
                                intl.formatMessage({
                                    id: 'admin.billing.label.lineItems.empty',
                                })
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

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ mt: 3 }} />
                </Grid>

                <Grid size={{ xs: 12 }}>
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
                                    {intl.formatMessage({
                                        id: 'admin.billing.paymentMethods.header',
                                    })}
                                </Typography>
                                <AlertBox short severity="error">
                                    <Typography component="div">
                                        {intl.formatMessage({
                                            id: 'admin.billing.error.paymentMethodsError',
                                        })}
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
