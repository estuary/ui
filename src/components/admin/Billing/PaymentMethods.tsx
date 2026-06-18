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
import { FormattedMessage } from 'react-intl';

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

const columns: TableColumns[] = [
    {
        field: 'type',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.cardType',
    },
    {
        field: 'name',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.name',
    },
    {
        field: 'last_four_digits',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.lastFour',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.details',
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
                        <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod.error" />
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
                        <FormattedMessage id="admin.billing.paymentMethods.header" />
                    </Typography>

                    {serverErrored ? null : (
                        <Typography>
                            <FormattedMessage id="admin.billing.paymentMethods.description" />
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
                            <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
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
                        <FormattedMessage id="admin.billing.error.paymentMethodsError" />
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
                                        {column.headerIntlKey ? (
                                            <FormattedMessage
                                                id={column.headerIntlKey}
                                            />
                                        ) : null}
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
                                            <FormattedMessage id="admin.billing.paymentMethods.table.emptyTableDefault.message" />
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
