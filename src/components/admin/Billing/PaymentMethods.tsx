import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { TableColumns } from 'src/types';

import { useEffect, useState } from 'react';

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

import { useMutation } from 'urql';

import {
    CREATE_BILLING_SETUP_INTENT,
    DELETE_BILLING_PAYMENT_METHOD,
    SET_BILLING_PAYMENT_METHOD,
} from 'src/api/gql/billing';
import AddPaymentMethod from 'src/components/admin/Billing/AddPaymentMethod';
import { BillingEditLock } from 'src/components/admin/Billing/BillingEditLock';
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
    // Remount dialog and action state when the selected tenant changes.
    return (
        <TenantPaymentMethods
            key={tenant}
            tenant={tenant}
            canEdit={canEdit}
            showAddPayment={showAddPayment}
        />
    );
}

function TenantPaymentMethods({
    tenant,
    canEdit,
    showAddPayment,
}: PaymentMethodsProps & { tenant: string }) {
    const {
        billing,
        isLoading,
        error,
        refresh: refreshPaymentMethods,
    } = useBillingPaymentMethods(tenant);
    const [, createSetupIntent] = useMutation(CREATE_BILLING_SETUP_INTENT);
    const [, setPrimary] = useMutation(SET_BILLING_PAYMENT_METHOD);
    const [, deleteMethod] = useMutation(DELETE_BILLING_PAYMENT_METHOD);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [setupIntentSecret, setSetupIntentSecret] = useState(
        INTENT_SECRET_LOADING
    );
    const [newMethodOpen, setNewMethodOpen] = useState(
        Boolean(showAddPayment && canEdit)
    );
    const [actionError, setActionError] = useState<string>();
    const methods = billing?.paymentMethods ?? [];
    const primaryId = billing?.primaryPaymentMethod?.id;
    const serverErrored = Boolean(error);

    const editLock = canEdit ? null : <BillingEditLock tenant={tenant} />;

    // Viewers cannot create setup intents, so skip the request.
    useEffect(() => {
        let current = true;
        if (tenant && canEdit) {
            void createSetupIntent({ tenant }).then((result) => {
                if (current) {
                    setSetupIntentSecret(
                        !result.error &&
                            result.data?.createBillingSetupIntent.clientSecret
                            ? result.data.createBillingSetupIntent.clientSecret
                            : INTENT_SECRET_ERROR
                    );
                }
            });
        }
        return () => {
            current = false;
        };
    }, [canEdit, createSetupIntent, tenant, refreshCounter]);

    const refreshSetup = () => {
        setRefreshCounter((value) => value + 1);
    };

    const makePrimary = async (id: string) => {
        if (!canEdit) {
            return;
        }
        setActionError(undefined);
        const result = await setPrimary({ tenant, paymentMethodId: id });
        if (result.error || !result.data?.setBillingPaymentMethod) {
            void refreshPaymentMethods();
            setActionError(
                result.error?.message ??
                    'Unable to make the payment method primary. Please try again.'
            );
        }
        refreshSetup();
    };

    const remove = async (id: string) => {
        if (!canEdit) {
            return;
        }
        setActionError(undefined);
        const result = await deleteMethod({ tenant, paymentMethodId: id });
        if (result.error || !result.data?.deleteBillingPaymentMethod) {
            void refreshPaymentMethods();
            setActionError(
                result.error?.message ??
                    'Unable to delete the payment method. Please try again.'
            );
        }
        refreshSetup();
    };

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

                    {serverErrored ? null : (
                        <Typography>
                            Enter your payment information. You won&apos;t be
                            charged until your account usage exceeds free tier
                            limits.
                        </Typography>
                    )}
                </Box>

                {serverErrored ? null : canEdit ? (
                    <AddPaymentMethod
                        show={newMethodOpen}
                        setOpen={setNewMethodOpen}
                        tenant={tenant}
                        setupIntentSecret={setupIntentSecret}
                        onRefresh={refreshPaymentMethods}
                        onComplete={(error) => {
                            refreshSetup();
                            setActionError(error);
                            if (error) {
                                void refreshPaymentMethods();
                            }
                        }}
                    />
                ) : (
                    editLock
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
                            {!tenant || isLoading ? (
                                <TableLoadingRows
                                    columnKeys={getColumnKeyList(columns)}
                                />
                            ) : methods.length > 0 ? (
                                methods.map((method) => (
                                    <PaymentMethod
                                        lock={editLock}
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
}

export default PaymentMethods;
