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
import { useMutation } from 'urql';

import {
    CREATE_BILLING_SETUP_INTENT,
    DELETE_BILLING_PAYMENT_METHOD,
    SET_BILLING_PAYMENT_METHOD,
} from 'src/api/gql/billing';
import AddPaymentMethod from 'src/components/admin/Billing/AddPaymentMethod';
import { PaymentMethod } from 'src/components/admin/Billing/PaymentMethodRow';
import AlertBox from 'src/components/shared/AlertBox';
import TableLoadingRows from 'src/components/tables/Loading';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
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

interface PaymentMethodsProps extends AdminBillingProps {
    canEdit: boolean;
}

function PaymentMethods({ canEdit, showAddPayment }: PaymentMethodsProps) {
    const tenant = useTenantStore((state) => state.selectedTenant);
    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );
    const {
        billing,
        isLoading,
        error,
        refresh: refreshPaymentMethods,
    } = useBillingPaymentMethods(tenant);
    const [
        { fetching: creatingSetup, error: setupError, data: setupData },
        createSetupIntent,
    ] = useMutation(CREATE_BILLING_SETUP_INTENT);
    const [{ fetching: settingPrimary }, setPrimary] = useMutation(
        SET_BILLING_PAYMENT_METHOD
    );
    const [{ fetching: deleting }, deleteMethod] = useMutation(
        DELETE_BILLING_PAYMENT_METHOD
    );
    const [actionError, setActionError] = useState<string>();
    const [pending, setPending] = useState<{
        id: string;
        action: 'delete' | 'primary';
    } | null>(null);
    const methods = billing?.paymentMethods ?? [];
    const primaryId = billing?.primaryPaymentMethod?.id;
    const setupIntentSecret =
        creatingSetup || setupError
            ? undefined
            : setupData?.createBillingSetupIntent.clientSecret;

    // Without EditBilling the server refuses setup intents, so skip the request.
    useEffect(() => {
        if (canEdit) {
            void createSetupIntent({ tenant });
        }
    }, [canEdit, createSetupIntent, tenant]);

    // Also finishes adding a payment method. Stripe may not report the new
    // method's id, which leaves only the table to refresh.
    const makePrimary = async (id?: string) => {
        if (id) setPending({ id, action: 'primary' });
        setActionError(undefined);
        const result =
            id && (await setPrimary({ tenant, paymentMethodId: id }));
        if (!result || result.error) {
            refreshPaymentMethods();
            if (result) {
                setActionError(
                    result.error?.graphQLErrors[0]?.message ??
                        'Unable to make the payment method primary. Please try again.'
                );
            }
        }
        setPending(null);
    };

    const remove = async (id: string) => {
        setPending({ id, action: 'delete' });
        setActionError(undefined);
        const result = await deleteMethod({ tenant, paymentMethodId: id });
        if (result.error) {
            setActionError(
                result.error.graphQLErrors[0]?.message ??
                    'Unable to delete the payment method. Please try again.'
            );
        }
        setPending(null);
    };

    if (error) {
        throw error;
    }

    return (
        <Stack spacing={3}>
            {setupError ? (
                <AlertBox short severity="error">
                    <Typography component="div">
                        There was an issue attempting to get a token from
                        Stripe. You cannot currently add a payment method. Try
                        again and if the issue persists please contact support.
                    </Typography>
                </AlertBox>
            ) : null}
            {actionError ? (
                <AlertBox short severity="error">
                    {actionError}
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

                    <Typography>
                        Enter your payment information. You won&apos;t be
                        charged until your account usage exceeds free tier
                        limits.
                    </Typography>
                </Box>

                {canEdit ? (
                    <AddPaymentMethod
                        autoOpen={Boolean(showAddPayment)}
                        tenant={tenant}
                        stripePromise={stripePromise}
                        loading={creatingSetup}
                        setupIntentSecret={setupIntentSecret}
                        onAdded={async (id) => {
                            await makePrimary(id);
                            void createSetupIntent({ tenant });
                        }}
                    />
                ) : null}
            </Stack>

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
                        {isLoading ? (
                            <TableLoadingRows
                                columnKeys={getColumnKeyList(columns)}
                            />
                        ) : methods.length > 0 ? (
                            methods.map((method) => (
                                <PaymentMethod
                                    canEdit={canEdit}
                                    busy={settingPrimary || deleting}
                                    pendingAction={
                                        pending?.id === method.id
                                            ? pending.action
                                            : undefined
                                    }
                                    onDelete={() => void remove(method.id)}
                                    onPrimary={() =>
                                        void makePrimary(method.id)
                                    }
                                    key={method.id}
                                    method={method}
                                    primary={method.id === primaryId}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography sx={{ textAlign: 'center' }}>
                                        No payment methods available.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
}

export default PaymentMethods;
