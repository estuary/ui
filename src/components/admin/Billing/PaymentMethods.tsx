import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
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
import { useTenantDetails } from 'context/fetcher/Tenant';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';

import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const PaymentMethods = () => {
    const stripePromise = useMemo(
        () => loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );
    const tenants = useTenantDetails();
    const grants = useCombinedGrantsExt({ adminOnly: true });

    const [refreshCounter, setRefreshCounter] = useState(0);

    const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

    const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(
        null
    );
    const [newMethodOpen, setNewMethodOpen] = useState(false);

    const [methodsLoading, setMethodsLoading] = useState(false);
    const [methods, setMethods] = useState<any[]>([]);
    const [defaultSource, setDefaultSource] = useState<string | null>(null);

    useEffect(() => {
        if (tenants && tenants.length > 0 && selectedTenant === null) {
            setSelectedTenant(tenants[0].tenant);
        }
    }, [selectedTenant, tenants]);

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
                        <FormattedMessage id="admin.billing.payment_methods.header" />
                    </Typography>

                    <Typography>
                        <FormattedMessage id="admin.billing.payment_methods.description" />
                    </Typography>
                </Box>

                <Box>
                    <Button onClick={() => setNewMethodOpen(true)}>
                        Add Payment Method
                    </Button>
                </Box>
            </Stack>

            {tenants && tenants.length > 1 ? (
                <FormControl size="small" sx={{ width: 350 }}>
                    <InputLabel>Tenant</InputLabel>

                    <Select
                        label="Tenant"
                        value={selectedTenant ?? ''}
                        onChange={(evt) => setSelectedTenant(evt.target.value)}
                        sx={{ borderRadius: 3 }}
                    >
                        {tenants
                            .filter((t) =>
                                grants.combinedGrants.find(
                                    (g) => g.object_role === t.tenant
                                )
                            )
                            .map((tenant) => (
                                <MenuItem key={tenant.id} value={tenant.tenant}>
                                    {tenant.tenant}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            ) : null}

            {selectedTenant && !methodsLoading ? (
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
                                <TableCell width={200}>Type</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Last 4 digits</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>Primary</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {methods.map((method) => (
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
                            ))}
                            {methods.length < 1 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography
                                            sx={{
                                                textAlign: 'center',
                                                fontSize: 15,
                                            }}
                                        >
                                            <FormattedMessage id="admin.billing.payment_methods.none_available" />
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : methodsLoading ? (
                <>
                    <Skeleton animation="wave" />
                    <Skeleton animation="wave" />
                    <Skeleton animation="wave" />
                </>
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
