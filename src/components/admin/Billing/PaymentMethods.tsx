import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { TableColumns } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import { loadStripe } from '@stripe/stripe-js';

import {
    deleteTenantPaymentMethod,
    getSetupIntentSecret,
    getTenantPaymentMethods,
    setTenantPrimaryPaymentMethod,
} from 'src/api/billing';
import AddPaymentMethod from 'src/components/admin/Billing/AddPaymentMethod';
import { PaymentMethod } from 'src/components/admin/Billing/PaymentMethodRow';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import AlertBox from 'src/components/shared/AlertBox';
import TableLoadingRows from 'src/components/tables/Loading';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { getColumnKeyList } from 'src/utils/table-utils';

const columns: (TableColumns & { header: string })[] = [
    {
        field: 'type',
        header: 'Type',
        width: 200,
    },
    {
        field: 'name',
        header: 'Name',
    },
    {
        field: 'last_four_digits',
        header: 'Last 4 Digits',
    },
    {
        field: 'details',
        header: 'Details',
    },
    {
        field: 'primary',
        header: 'Primary',
    },
    {
        field: 'actions',
        header: 'Actions',
    },
];

const PaymentMethods = ({ showAddPayment }: AdminBillingProps) => {
    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const setPaymentMethodStatus = useBillingStore(
        (state) => state.setPaymentMethodStatus
    );

    const [refreshCounter, setRefreshCounter] = useState(0);

    const [setupIntentSecret, setSetupIntentSecret] = useState(
        INTENT_SECRET_LOADING
    );
    const [newMethodOpen, setNewMethodOpen] = useState(showAddPayment ?? false);

    const [methodsLoading, setMethodsLoading] = useState(false);
    const [methods, setMethods] = useState<any[] | undefined>([]);
    const [defaultSource, setDefaultSource] = useState<
        string | null | undefined
    >(null);

    // These are two different iifes so this component loads just a _tiny bit_ faster
    useEffect(() => {
        let active = true;
        void (async () => {
            if (selectedTenant) {
                const setupResponse =
                    await getSetupIntentSecret(selectedTenant);

                if (!active) {
                    return;
                }

                if (setupResponse.data?.intent_secret) {
                    setSetupIntentSecret(setupResponse.data.intent_secret);
                } else {
                    setSetupIntentSecret(INTENT_SECRET_ERROR);
                }
            }
        })();

        void (async () => {
            if (selectedTenant) {
                setMethodsLoading(true);

                try {
                    // TODO (optimization): Add proper typing and error handling for this service call. The response assumes
                    //  an unexpected shape when the service errors. The error property is null and the data property
                    //  is an object with the following shape: { error: string; }. Consequently, an undefined value is passed
                    //  to the setters below (unbeknownst to the compiler given the state typing defined above), causing the
                    //  the component to lean on the ErrorBoundary wrapper for its display in the presence of an error.

                    // TODO (store payment method info) we load this for the first 5 tenants so we should just pull that info
                    const methodsResponse =
                        await getTenantPaymentMethods(selectedTenant);

                    if (active) {
                        setMethods(methodsResponse.data?.payment_methods);
                        setDefaultSource(methodsResponse.data?.primary);
                        setPaymentMethodStatus(
                            selectedTenant,
                            methodsResponse.data?.payment_methods
                        );
                    }
                } finally {
                    if (active) {
                        setMethodsLoading(false);
                    }
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [selectedTenant, refreshCounter, setPaymentMethodStatus]);

    // TODO (optimization): Remove this temporary, hacky means of detecting when the payment methods service errs
    //   when proper error handling is in place.
    const serverErrored = useMemo(
        () =>
            !methodsLoading &&
            (typeof defaultSource === 'undefined' ||
                typeof methods === 'undefined'),
        [defaultSource, methods, methodsLoading]
    );

    useEffect(() => {
        if (serverErrored) {
            logRocketEvent(CustomEvents.ERROR_BOUNDARY_PAYMENT_METHODS);
        }
    }, [serverErrored]);

    return (
        <Stack spacing={serverErrored ? 0 : 3}>
            {setupIntentSecret === INTENT_SECRET_ERROR ? (
                <AlertBox short severity="error">
                    <Typography component="div">
                        There was an issue attempting to get a token from
                        Stripe. You cannot currently add a payment method. Try
                        again and if the issue persists please contact support.
                    </Typography>
                </AlertBox>
            ) : null}

            <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1, justifyContent: 'space-between' }}
            >
                <Box>
                    <Typography
                        sx={{
                            mb: 1,
                            fontSize: 18,
                            fontWeight: '400',
                        }}
                    >
                        Payment Information
                    </Typography>

                    {serverErrored ? null : (
                        <Typography>
                            Enter your payment information. You won&apos;t be
                            charged until your account usage exceeds free tier
                            limits.
                        </Typography>
                    )}
                </Box>

                {serverErrored ? null : (
                    <AddPaymentMethod
                        show={newMethodOpen}
                        setOpen={setNewMethodOpen}
                        tenant={selectedTenant}
                        onSuccess={() => setRefreshCounter((r) => r + 1)}
                        stripePromise={stripePromise}
                        setupIntentSecret={setupIntentSecret}
                    />
                )}
            </Stack>

            {serverErrored ? (
                <AlertBox short severity="error">
                    <Typography component="div">
                        There was an error connecting with our payment provider.
                        Please try again later.
                    </Typography>
                </AlertBox>
            ) : (
                <TableContainer>
                    <Table
                        sx={{ minWidth: 650 }}
                        aria-label="simple table"
                        size="small"
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {columns.map((column, index) => (
                                    <TableCell
                                        key={`${column.field}-${index}`}
                                        width={column.width ?? 'auto'}
                                    >
                                        {column.header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!selectedTenant || methodsLoading ? (
                                <TableLoadingRows
                                    columnKeys={getColumnKeyList(columns)}
                                />
                            ) : methods && methods.length > 0 ? (
                                methods.map((method) => (
                                    <PaymentMethod
                                        onDelete={async () => {
                                            await deleteTenantPaymentMethod(
                                                selectedTenant,
                                                method.id
                                            );
                                            setRefreshCounter((r) => r + 1);
                                        }}
                                        onPrimary={async () => {
                                            await setTenantPrimaryPaymentMethod(
                                                selectedTenant,
                                                method.id
                                            );
                                            setRefreshCounter((r) => r + 1);
                                        }}
                                        key={method.id}
                                        {...method}
                                        primary={method.id === defaultSource}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography
                                            sx={{ textAlign: 'center' }}
                                        >
                                            No payment methods available.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    );
};

export default PaymentMethods;
