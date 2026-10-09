import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { InvoiceId } from 'src/utils/billing-utils';

import { useState } from 'react';

import {
    Box,
    CircularProgress,
    Divider,
    Grid,
    Typography,
} from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';

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
    const access = useBillingAccess(selectedTenant);
    // The selector picks a tenant once the user's tenants load.
    const status = access.error
        ? 'error'
        : !selectedTenant || access.isLoading
          ? 'loading'
          : access.canView
            ? 'granted'
            : 'denied';

    return (
        <>
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {'Billing'}
                    </Typography>

                    {status === 'granted' ? <PricingTierDetails /> : null}
                </Grid>

                <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <TenantOptions />
                </Grid>
            </Grid>

            {status === 'granted' ? (
                // Remount per tenant so one tenant's results and errors never
                // show for the next.
                <BillingDetails
                    key={selectedTenant}
                    canEdit={access.canEdit}
                    showAddPayment={showAddPayment}
                />
            ) : status === 'loading' ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress aria-label="Loading billing access" />
                </Box>
            ) : status === 'error' ? (
                <AlertBox short severity="error">
                    There was an error loading your billing permissions. Please
                    try again later.
                </AlertBox>
            ) : (
                <AlertBox short severity="warning">
                    You don&apos;t have permission to view billing for{' '}
                    {selectedTenant}.
                </AlertBox>
            )}
        </>
    );
}

// Mounted only once the user can view the selected tenant's billing, so none
// of these queries run without access.
function BillingDetails({
    canEdit,
    showAddPayment,
}: AdminBillingProps & { canEdit: boolean }) {
    const [selectedInvoiceId, setSelectedInvoiceId] =
        useState<InvoiceId | null>(null);
    const { isLoading, selectedInvoice } =
        useBillingInvoices(selectedInvoiceId);

    return (
        <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
            <BillingLoadError />

            <Grid size={{ xs: 12, md: 6 }}>
                <CardWrapper
                    height={TOTAL_CARD_HEIGHT}
                    message="Recent History"
                >
                    <BillingHistoryTable
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
                                    start_date={selectedInvoice.date_start}
                                    end_date={selectedInvoice.date_end}
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
                                {'Payment Information'}
                            </Typography>
                            <AlertBox short severity="error">
                                <Typography component="div">
                                    {
                                        'There was an error connecting with our payment provider. Please try again later.'
                                    }
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
                    <PaymentMethods
                        canEdit={canEdit}
                        showAddPayment={showAddPayment}
                    />
                </ErrorBoundary>
            </Grid>
        </Grid>
    );
}

export default AdminBilling;
