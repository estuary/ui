import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { InvoiceId } from 'src/utils/billing-utils';

import { useState } from 'react';

import { Divider, Grid, Stack } from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';

import { BILLING_HISTORY_PAGE_SIZE } from 'src/api/gql/billing';
import { authenticatedRoutes } from 'src/app/routes';
import { BillingContactSection } from 'src/components/admin/Billing/BillingContactSection';
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
import { useBillingAccess } from 'src/hooks/billing/useBillingAccess';
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

            {/* The selector picks a tenant once the user's tenants load. It lists only tenants with a legacy admin grant, which billing-only users lack. */}
            {selectedTenant ? (
                // Remount per tenant so one tenant's results and errors never
                // show for the next.
                <BillingForTenant
                    key={selectedTenant}
                    tenant={selectedTenant}
                    showAddPayment={showAddPayment}
                />
            ) : null}
        </>
    );
}

function BillingForTenant({
    tenant,
    showAddPayment,
}: AdminBillingProps & { tenant: string }) {
    const access = useBillingAccess(tenant);

    if (access.error) {
        return (
            <AlertBox short severity="error">
                There was an error loading your billing permissions. Please try
                again later.
            </AlertBox>
        );
    }

    if (access.isLoading) {
        return null;
    }

    if (!access.canView) {
        return (
            <AlertBox short severity="warning">
                You don&apos;t have permission to view billing for {tenant}.
            </AlertBox>
        );
    }

    return (
        <ErrorBoundary
            fallback={
                <AlertBox short severity="error">
                    There was an error loading your billing information. Please
                    try again later.
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
            <BillingDetails
                canEdit={access.canEdit}
                showAddPayment={showAddPayment}
            />
        </ErrorBoundary>
    );
}

// Mounted only once the user can view the selected tenant's billing, so none
// of these queries run without access.
function BillingDetails({
    canEdit,
    showAddPayment,
}: AdminBillingProps & { canEdit: boolean }) {
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
                <Stack spacing={3} divider={<Divider />}>
                    <BillingContactSection canEdit={canEdit} />
                    <PaymentMethods
                        canEdit={canEdit}
                        showAddPayment={showAddPayment}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
}

export default AdminBilling;
