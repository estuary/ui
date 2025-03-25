import type { TableColumns } from 'types';
import type { AdminBillingProps } from './types';
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
} from 'api/billing';
import { PaymentMethod } from 'components/admin/Billing/PaymentMethodRow';
import AlertBox from 'components/shared/AlertBox';
import TableLoadingRows from 'components/tables/Loading';

import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { getColumnKeyList } from 'utils/table-utils';
import AddPaymentMethod from './AddPaymentMethod';
import { INTENT_SECRET_ERROR, INTENT_SECRET_LOADING } from './shared';

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

const PaymentMethods = ({ showAddPayment }: AdminBillingProps) => {
    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const setPaymentMethodExists = useBillingStore(
        (state) => state.setPaymentMethodExists
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
        void (async () => {
            if (selectedTenant) {
                const setupResponse = await getSetupIntentSecret(
                    selectedTenant
                );

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
                    const methodsResponse = await getTenantPaymentMethods(
                        selectedTenant
                    );

                    setMethods(methodsResponse.data?.payment_methods);
                    setDefaultSource(methodsResponse.data?.primary);
                } finally {
                    setMethodsLoading(false);
                }
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
            {setupIntentSecret === INTENT_SECRET_ERROR ? (
                <AlertBox short severity="error">
                    <Typography component="div">
                        <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod.error" />
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
                        <FormattedMessage id="admin.billing.paymentMethods.header" />
                    </Typography>

                    {serverErrored ? null : (
                        <Typography>
                            <FormattedMessage id="admin.billing.paymentMethods.description" />
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
                                            <FormattedMessage id="admin.billing.paymentMethods.table.emptyTableDefault.message" />
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
