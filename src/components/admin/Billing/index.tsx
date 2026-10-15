import type { AdminBillingProps } from 'src/components/admin/Billing/types';

import { useEffect, useMemo } from 'react';
import useConstant from 'use-constant';

import { Divider, Grid, Typography } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';
import { useUnmount } from 'react-use';

import { getInvoicesBetween } from 'src/api/billing';
import { authenticatedRoutes } from 'src/app/routes';
import DateRange from 'src/components/admin/Billing/DateRange';
import BillingLoadError from 'src/components/admin/Billing/LoadError';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'src/components/admin/Billing/PricingTierDetails';
import { INVOICE_ROW_HEIGHT } from 'src/components/admin/Billing/shared';
import AdminTabs from 'src/components/admin/Tabs';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import GraphStateWrapper from 'src/components/graphs/states/Wrapper';
import UsageByMonthGraph from 'src/components/graphs/UsageByMonthGraph';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import TenantSelector from 'src/components/shared/TenantSelector';
import BillingHistoryTable from 'src/components/tables/Billing';
import BillingLineItemsTable from 'src/components/tables/BillLineItems';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    useBilling_selectedInvoice,
    useBillingStore,
} from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
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

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    return (
        <>
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {'Billing'}
                    </Typography>

                    {/* Remount per tenant, like the details below. */}
                    <PricingTierDetails key={selectedTenant} />
                </Grid>

                <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <TenantSelector />
                </Grid>
            </Grid>

            {/* The selector picks a tenant once the user's tenants load. */}
            {selectedTenant ? (
                // Remount per tenant so one tenant's results and errors never
                // show for the next.
                <ErrorBoundary
                    key={selectedTenant}
                    fallback={
                        <AlertBox short severity="error">
                            There was an error loading your billing information.
                            Please try again later.
                        </AlertBox>
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
                    <BillingDetails showAddPayment={showAddPayment} />
                </ErrorBoundary>
            ) : null}
        </>
    );
}

function BillingDetails({ showAddPayment }: AdminBillingProps) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    // Billing Store
    // TODO (billing store)
    // The `active` stuff could probably be removed now that other stuff is
    //  cleaned up - but leaving to make it easier
    const [active, setActive] = useBillingStore(
        useShallow((state) => [state.active, state.setActive])
    );
    const [hydrated, setHydrated] = useBillingStore(
        useShallow((state) => [state.hydrated, state.setHydrated])
    );
    const setHydrationErrorsExist = useBillingStore(
        (state) => state.setHydrationErrorsExist
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
                    setActive(false);
                }
            })();
        }
    }, [
        dateRange.end,
        dateRange.start,
        selectedTenant,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setInvoices,
        setNetworkFailed,
    ]);

    useUnmount(() => resetBillingState());

    return (
        <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
            <BillingLoadError />

            <Grid size={{ xs: 12, md: 6 }}>
                <CardWrapper
                    height={TOTAL_CARD_HEIGHT}
                    message="Recent History"
                >
                    <BillingHistoryTable />
                </CardWrapper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <CardWrapper
                    height={TOTAL_CARD_HEIGHT}
                    message="Usage by Month"
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
                            'Loading your bill'
                        ) : selectedInvoice ? (
                            <>
                                {'Your bill for:'}
                                <DateRange
                                    start_date={selectedInvoice.date_start}
                                    end_date={selectedInvoice.date_end}
                                />
                            </>
                        ) : (
                            'No bill to display'
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
                <PaymentMethods showAddPayment={showAddPayment} />
            </Grid>
        </Grid>
    );
}

export default AdminBilling;
