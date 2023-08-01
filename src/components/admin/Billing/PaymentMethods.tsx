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
import AlertBox from 'components/shared/AlertBox';
import TableLoadingRows from 'components/tables/Loading';

import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    useBilling_selectedTenant,
    useBilling_setPaymentMethodExists,
} from 'stores/Billing/hooks';
import { TableColumns } from 'types';

const columns: TableColumns[] = [
    {
        field: 'type',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.cardType',
        width: 200,
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
    const stripePromise = useMemo(
        () => loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    const selectedTenant = useBilling_selectedTenant();
    const setPaymentMethodExists = useBilling_setPaymentMethodExists();

    const [refreshCounter, setRefreshCounter] = useState(0);

    const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(
        null
    );
    const [newMethodOpen, setNewMethodOpen] = useState(false);

    const [methodsLoading, setMethodsLoading] = useState(false);
    const [methods, setMethods] = useState<any[] | undefined>([]);
    const [defaultSource, setDefaultSource] = useState<
        string | null | undefined
    >(null);

    useEffect(() => {
        void (async () => {
            if (selectedTenant) {
                try {
                    setMethodsLoading(true);

                    // TODO (optimization): Add proper typing and error handling for this service call. The response assumes
                    //  an unexpected shape when the service errors. The error property is null and the data property
                    //  is an object with the following shape: { error: string; }. Consequently, an undefined value is passed
                    //  to the setters below (unbeknownst to the compiler given the state typing defined above), causing the
                    //  the component to lean on the ErrorBoundary wrapper for its display in the presence of an error.
                    const methodsResponse = await getTenantPaymentMethods(
                        selectedTenant
                    );

                    setMethods(methodsResponse.data?.payment_methods);
                    setDefaultSource(methodsResponse.data?.primary);
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

    useEffect(() => {
        if (!methodsLoading) {
            setPaymentMethodExists(methods);
        }
    }, [setPaymentMethodExists, methods, methodsLoading]);

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
                        <FormattedMessage id="admin.billing.paymentMethods.header" />
                    </Typography>

                    {serverErrored ? null : (
                        <Typography>
                            <FormattedMessage id="admin.billing.paymentMethods.description" />
                        </Typography>
                    )}
                </Box>

                {serverErrored ? null : (
                    <Box>
                        <Button
                            onClick={() => setNewMethodOpen(true)}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
                        </Button>
                    </Box>
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
                            {!selectedTenant || methodsLoading ? (
                                <TableLoadingRows columns={columns} />
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
                                            <FormattedMessage id="admin.billing.paymentMethods.table.emptyTableDefault.message" />
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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
