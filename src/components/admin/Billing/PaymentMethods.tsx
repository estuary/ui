import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    deleteTenantPaymentMethod,
    getSetupIntentSecret,
    getTenantPaymentMethods,
    setTenantPrimaryPaymentMethod,
} from 'api/billing';
import { PaymentForm } from 'components/admin/Billing/CapturePaymentMethod';
import { PaymentMethod } from 'components/admin/Billing/PaymentMethodRow';
import TableLoadingRows from 'components/tables/Loading';

import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBilling_selectedTenant } from 'stores/Billing/hooks';
import { TableColumns } from 'types';
import { hasLength } from 'utils/misc-utils';

const cardTypeField = 'type';

const columns: TableColumns[] = [
    {
        field: cardTypeField,
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
        field: 'primary',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.primary',
    },
    {
        field: 'actions',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.actions',
    },
];

const PaymentMethods = () => {
    const selectedTenant = useBilling_selectedTenant();

    const [refreshCounter, setRefreshCounter] = useState(0);

    const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(
        null
    );
    const [newMethodOpen, setNewMethodOpen] = useState(false);

    const [methodsLoading, setMethodsLoading] = useState(false);
    const [methods, setMethods] = useState<any[]>([]);
    const [defaultSource, setDefaultSource] = useState<string | null>(null);

    const stripePromise = useMemo(
        () => loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    useEffect(() => {
        void (async () => {
            if (selectedTenant) {
                try {
                    setMethodsLoading(true);
                    const methodsResponse = await getTenantPaymentMethods(
                        selectedTenant
                    );
                    setMethods(methodsResponse.data.payment_methods);
                    setDefaultSource(methodsResponse.data.primary);
                } finally {
                    setMethodsLoading(false);
                }

                const setupResponse = await getSetupIntentSecret(
                    selectedTenant
                );
                setSetupIntentSecret(setupResponse.data.intent_secret);
            }
        })();
    }, [selectedTenant, refreshCounter]);

    return (
        <Stack spacing={3}>
            <Stack
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
                        <FormattedMessage id="admin.billing.paymentMethods.header" />
                    </Typography>

                    <Typography>
                        <FormattedMessage id="admin.billing.paymentMethods.description" />
                    </Typography>
                </Box>

                <Box>
                    <Button onClick={() => setNewMethodOpen(true)}>
                        Add Payment Method
                    </Button>
                </Box>
            </Stack>

            {selectedTenant ? (
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
                                        width={
                                            column.field === cardTypeField
                                                ? 200
                                                : 'auto'
                                        }
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
                            {methodsLoading ? (
                                <TableLoadingRows columns={columns} />
                            ) : hasLength(methods) ? (
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
                                            <FormattedMessage id="admin.billing.paymentMethods.table.emptyTableDefault.message" />
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}

            <Dialog
                maxWidth="sm"
                fullWidth
                sx={{ padding: 2 }}
                open={newMethodOpen}
                onClose={() => setNewMethodOpen(false)}
            >
                <DialogTitle>Add a payment method</DialogTitle>
                {selectedTenant && setupIntentSecret ? (
                    <Elements
                        stripe={stripePromise}
                        options={{ clientSecret: setupIntentSecret }}
                    >
                        <PaymentForm
                            onSuccess={async (id) => {
                                if (id) {
                                    await setTenantPrimaryPaymentMethod(
                                        selectedTenant,
                                        id
                                    );
                                }
                                setNewMethodOpen(false);
                                setRefreshCounter((r) => r + 1);
                            }}
                            onError={console.log}
                        />
                    </Elements>
                ) : (
                    <DialogContent>Loading...</DialogContent>
                )}
            </Dialog>
        </Stack>
    );
};

export default PaymentMethods;
