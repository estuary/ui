import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { InvoiceId } from 'src/utils/billing-utils';

import { useState } from 'react';

import { Divider, Grid } from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';

import { BILLING_HISTORY_PAGE_SIZE } from 'src/api/gql/billing';
import { authenticatedRoutes } from 'src/app/routes';
import DateRange from 'src/components/admin/Billing/DateRange';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
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
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
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

            <Grid
                container
                spacing={{ xs: 3, md: 2 }}
                sx={{ py: 2, justifyContent: 'flex-end' }}
            >
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
                    onError={(error, { componentStack }) => {
                        logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED, {
                            area: 'Billing',
                            message: error.message,
                            stack: error.stack,
                            componentStack,
                        });
                    }}
                >
                    <BillingDetails showAddPayment={showAddPayment} />
                </ErrorBoundary>
            ) : null}
        </>
    );
}

function BillingDetails({ showAddPayment }: AdminBillingProps) {
    const history = useBillingInvoices({
        pageSize: BILLING_HISTORY_PAGE_SIZE,
        withStripe: true,
    });
    const { invoices, isLoading } = history;
    const [selectedInvoiceId, setSelectedInvoiceId] =
        useState<InvoiceId | null>(null);
    // The selected invoice if it's on this page, otherwise the page's newest.
    const selectedInvoice =
        invoices.find((invoice) => invoiceId(invoice) === selectedInvoiceId) ??
        invoices.at(0) ??
        null;

    return (
        <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <CardWrapper
                    height={TOTAL_CARD_HEIGHT}
                    message="Recent History"
                >
                    <BillingHistoryTable
                        history={history}
                        selectedInvoiceId={
                            selectedInvoice ? invoiceId(selectedInvoice) : null
                        }
                        onSelectInvoice={setSelectedInvoiceId}
                    />
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
                        isLoading ? (
                            'Loading your bill'
                        ) : selectedInvoice ? (
                            <>
                                {'Your bill for:'}
                                <DateRange
                                    start_date={selectedInvoice.dateStart}
                                    end_date={selectedInvoice.dateEnd}
                                />
                            </>
                        ) : (
                            'No bill to display'
                        )
                    }
                >
                    {!isLoading ? (
                        <BillingLineItemsTable
                            selectedInvoice={selectedInvoice}
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
