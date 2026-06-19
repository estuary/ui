import type { AdminBillingProps } from 'src/components/admin/Billing/types';

import { Box, Divider, Stack, Typography } from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';

import { authenticatedRoutes } from 'src/app/routes';
import DateRange from 'src/components/admin/Billing/DateRange';
import BillingLoadError from 'src/components/admin/Billing/LoadError';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'src/components/admin/Billing/PricingTierDetails';
import TenantOptions from 'src/components/admin/Billing/TenantOptions';
import AdminTabs from 'src/components/admin/Tabs';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import GraphStateWrapper from 'src/components/graphs/states/Wrapper';
import UsageByMonthGraph from 'src/components/graphs/UsageByMonthGraph';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import BillingHistoryTable from 'src/components/tables/Billing';
import BillingLineItemsTable from 'src/components/tables/BillLineItems';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { invoiceId, TOTAL_CARD_HEIGHT } from 'src/utils/billing-utils';

const routeTitle = authenticatedRoutes.admin.billing.title;

function AdminBilling({ showAddPayment }: AdminBillingProps) {
    usePageTitle({
        header: routeTitle,
        headerLink: 'https://www.estuary.dev/pricing/',
    });

    const { isLoading, selectedInvoice } = useBillingInvoices();

    return (
        <>
            <AdminTabs />

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 3, md: 2 }}
                sx={{
                    p: 2,
                    justifyContent: 'space-between',
                    alignItems: { md: 'end' },
                }}
            >
                <div>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Billing
                    </Typography>

                    <PricingTierDetails />
                </div>

                <Box
                    sx={{
                        display: 'flex',
                        width: { xs: '100%', md: 250 },
                        flexShrink: 0,
                    }}
                >
                    <TenantOptions />
                </Box>
            </Stack>

            <Stack spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <CardWrapper
                    height={TOTAL_CARD_HEIGHT}
                    message="Usage by Month"
                >
                    <GraphStateWrapper>
                        <UsageByMonthGraph />
                    </GraphStateWrapper>
                </CardWrapper>
                <BillingLoadError />

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 3, md: 2 }}
                    sx={{
                        alignItems: 'stretch',
                    }}
                >
                    <CardWrapper
                        message="Invoices"
                        // sx={{ flex: 1 }}
                    >
                        <BillingHistoryTable />
                    </CardWrapper>

                    <CardWrapper
                        sx={{ flex: 1 }}
                        height={TOTAL_CARD_HEIGHT}
                        message={
                            isLoading ? (
                                'Loading your bill'
                            ) : selectedInvoice ? (
                                <>
                                    Your bill for:
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
                </Stack>

                <Divider sx={{ mt: 3 }} />

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
                                Payment Information
                            </Typography>
                            <AlertBox short severity="error">
                                <Typography component="div">
                                    There was an error connecting with our
                                    payment provider. Please try again later.
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
            </Stack>
        </>
    );
}

export default AdminBilling;
