import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { TableColumns } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    Button,
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
import { Plus } from 'iconoir-react';

import { AddPaymentMethodDialog } from 'src/components/admin/Billing/AddPaymentMethod';
import { DeletePaymentMethodDialog } from 'src/components/admin/Billing/DeletePaymentMethodDialog';
import { PaymentMethod } from 'src/components/admin/Billing/PaymentMethodRow';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import AlertBox from 'src/components/shared/AlertBox';
import TableLoadingRows from 'src/components/tables/Loading';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { getColumnKeyList } from 'src/utils/table-utils';

const columns: (TableColumns & { header?: string })[] = [
    {
        field: 'type',
        header: 'Type',
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
        header: 'Exp',
    },
    {
        field: 'actions',
        align: 'center',
        width: 100,
    },
];

const PaymentMethods = ({ showAddPayment }: AdminBillingProps) => {
    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const setPaymentMethodExists = useBillingStore(
        (state) => state.setPaymentMethodExists
    );

    const [newMethodOpen, setNewMethodOpen] = useState(showAddPayment ?? false);

    const [methodIdToDelete, setMethodIdToDelete] = useState<string | null>(
        null
    );

    const {
        methods,
        primaryId,
        isLoading,
        serverErrored,
        setupIntentSecret,
        setPrimary,
        deleteMethod,
        refresh,
    } = useBillingPaymentMethods();

    useEffect(() => {
        if (!isLoading) {
            setPaymentMethodExists(methods);
        }
    }, [isLoading, methods, setPaymentMethodExists]);

    useEffect(() => {
        if (serverErrored) {
            logRocketEvent(CustomEvents.ERROR_BOUNDARY_PAYMENT_METHODS);
        }
    }, [serverErrored]);

    const enable =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

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
                direction={{ xs: 'column', md: 'row' }}
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
                            {
                                "Enter your payment information. You won't be charged until your account usage exceeds free tier limits."
                            }
                        </Typography>
                    )}
                </Box>

                {serverErrored ? null : (
                    <>
                        <Button
                            loadingPosition="start"
                            disabled={!enable}
                            loading={
                                setupIntentSecret === INTENT_SECRET_LOADING
                            }
                            onClick={() => setNewMethodOpen(true)}
                            startIcon={<Plus style={{ fontSize: 15 }} />}
                            sx={{
                                whiteSpace: 'nowrap',
                                width: { xs: '100%', md: 'auto' },
                                alignSelf: 'flex-start',
                            }}
                            variant="contained"
                        >
                            Add Payment Method
                        </Button>
                        <AddPaymentMethodDialog
                            show={newMethodOpen}
                            setOpen={setNewMethodOpen}
                            tenant={selectedTenant}
                            onSuccess={async (id) => {
                                if (id) {
                                    await setPrimary(id);
                                }
                                // A card was added, so the list itself changed.
                                refresh();
                            }}
                            stripePromise={stripePromise}
                            setupIntentSecret={setupIntentSecret}
                        />
                    </>
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
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {columns.map((column, index) => (
                                    <TableCell
                                        align={column.align ?? 'left'}
                                        key={`${column.field}-${index}`}
                                        width={column.width ?? 'auto'}
                                    >
                                        {column.header ?? null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!selectedTenant || isLoading ? (
                                <TableLoadingRows
                                    columnKeys={getColumnKeyList(columns)}
                                />
                            ) : methods.length > 0 ? (
                                methods.map((method) => (
                                    <PaymentMethod
                                        onDelete={() =>
                                            setMethodIdToDelete(method.id)
                                        }
                                        onPrimary={() => setPrimary(method.id)}
                                        key={method.id}
                                        {...method}
                                        primary={method.id === primaryId}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
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

            <DeletePaymentMethodDialog
                open={Boolean(methodIdToDelete)}
                onClose={() => setMethodIdToDelete(null)}
                onConfirm={async () => {
                    if (methodIdToDelete) {
                        await deleteMethod(methodIdToDelete);
                    }
                    setMethodIdToDelete(null);
                }}
            />
        </Stack>
    );
};

export default PaymentMethods;
