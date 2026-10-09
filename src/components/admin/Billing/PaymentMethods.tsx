import type { AdminBillingProps } from 'src/components/admin/Billing/types';
import type { TableColumns } from 'src/types';

import { useCallback, useEffect, useState } from 'react';

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
import { BillingContactDialog } from 'src/components/admin/Billing/BillingContactDialog';
import { BillingEditLock } from 'src/components/admin/Billing/BillingEditLock';
import { PaymentMethod } from 'src/components/admin/Billing/PaymentMethodRow';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import AlertBox from 'src/components/shared/AlertBox';
import TableLoadingRows from 'src/components/tables/Loading';
import { useBillingContact } from 'src/hooks/billing/useBillingContact';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
import { useTenantStore } from 'src/stores/Tenant';
import { getContactStatus } from 'src/utils/billing-contact-utils';
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
    const {
        contact,
        isLoading: contactLoading,
        error: contactError,
    } = useBillingContact(tenant);
    const [, createSetupIntent] = useMutation(CREATE_BILLING_SETUP_INTENT);
    const [, setPrimary] = useMutation(SET_BILLING_PAYMENT_METHOD);
    const [, deleteMethod] = useMutation(DELETE_BILLING_PAYMENT_METHOD);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [setupIntentSecret, setSetupIntentSecret] = useState(
        INTENT_SECRET_LOADING
    );
    const [newMethodOpen, setNewMethodOpen] = useState(false);
    // Adding a payment method starts with the billing contact when it is
    // incomplete. Saving it continues to the payment form as step 2.
    const [contactOpen, setContactOpen] = useState(false);
    const [continuedFromContact, setContinuedFromContact] = useState(false);
    const [autoOpenPending, setAutoOpenPending] = useState(
        Boolean(showAddPayment && canEdit)
    );
    const [actionError, setActionError] = useState<string>();
    const methods = billing?.paymentMethods ?? [];
    const primaryId = billing?.primaryPaymentMethod?.id;

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

    const contactComplete = getContactStatus(contact) === 'complete';
    const startAddPayment = useCallback(() => {
        if (!canEdit) {
            return;
        }
        if (contactComplete) {
            setContinuedFromContact(false);
            setNewMethodOpen(true);
        } else {
            setContactOpen(true);
        }
    }, [canEdit, contactComplete]);

    // The add-payment route starts the flow once the contact loads.
    useEffect(() => {
        if (autoOpenPending && !contactLoading) {
            setAutoOpenPending(false);
            startAddPayment();
        }
    }, [autoOpenPending, contactLoading, startAddPayment]);

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

    // The page shows one error for the contact and payment sections.
    const loadError = error ?? contactError;
    if (loadError) {
        throw loadError;
    }

    return (
        <Stack spacing={3}>
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

                    <Typography>
                        Enter your payment information. You won&apos;t be
                        charged until your account usage exceeds free tier
                        limits.
                    </Typography>
                </Box>

                {canEdit ? (
                    <AddPaymentMethod
                        show={newMethodOpen}
                        setOpen={setNewMethodOpen}
                        onStart={startAddPayment}
                        starting={contactLoading}
                        step={continuedFromContact ? 'Step 2 of 2' : undefined}
                        contact={contact}
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
                                    <Typography sx={{ textAlign: 'center' }}>
                                        No payment methods available.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {canEdit ? (
                <BillingContactDialog
                    open={contactOpen}
                    tenant={tenant}
                    contact={contact}
                    mode="continue"
                    onClose={() => setContactOpen(false)}
                    onSaved={() => {
                        setContactOpen(false);
                        setContinuedFromContact(true);
                        setNewMethodOpen(true);
                    }}
                />
            ) : null}
        </Stack>
    );
}

export default PaymentMethods;
