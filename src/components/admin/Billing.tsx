import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
import {
    AddressElement,
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Auth } from '@supabase/ui';
import {
    deleteTenantPaymentMethod,
    getSetupIntentSecret,
    getTenantPaymentMethods,
    setTenantPrimaryPaymentMethod,
} from 'api/billing';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import MessageWithLink from 'components/content/MessageWithLink';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import usePageTitle from 'hooks/usePageTitle';
import useTenants from 'hooks/useTenants';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getUserDetails } from 'services/supabase';
import AmexLogo from '../../images/payment-methods/amex.png';
import DiscoverLogo from '../../images/payment-methods/discover.png';
import MastercardLogo from '../../images/payment-methods/mastercard.png';
import VisaLogo from '../../images/payment-methods/visa.png';

const cardLogos = {
    amex: AmexLogo,
    discover: DiscoverLogo,
    visa: VisaLogo,
    mastercard: MastercardLogo,
};

const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? ''
);

interface PaymentMethodProps {
    onDelete(): void;
    onPrimary(): void;
    primary: boolean;
    id: string;
    type: 'card' | 'us_bank_account';
    billing_details: {
        address: {
            city: string;
            country: string;
            line1: string;
            line2: string;
            postal_code: string;
            state: string;
        };
        email: string;
        name: string;
    };
    card: {
        brand:
            | 'amex'
            | 'diners'
            | 'discover'
            | 'eftpos_au'
            | 'jcb'
            | 'mastercard'
            | 'unionpay'
            | 'visa'
            | 'unknown';
        country: string;
        exp_month: number;
        exp_year: number;
        last4: number;
    };
    us_bank_account: {
        account_holder_type: 'individual' | 'company';
        account_type: 'checking' | 'savings';
        bank_name: string;
        last4: number;
    };
}

const PaymentMethod = ({
    type,
    onDelete,
    onPrimary,
    billing_details,
    card,
    us_bank_account,
    primary,
}: PaymentMethodProps) => {
    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>
                {type === 'card' ? (
                    cardLogos[card.brand] ? (
                        <img
                            style={{ height: 35 }}
                            src={cardLogos[card.brand]}
                            alt={`${card.brand} card logo`}
                        />
                    ) : (
                        card.brand
                    )
                ) : (
                    us_bank_account.bank_name
                )}
            </TableCell>
            <TableCell>{billing_details.name}</TableCell>
            <TableCell>
                {type === 'card' ? card.last4 : us_bank_account.last4}
            </TableCell>
            <TableCell>
                {type === 'card' ? (
                    <>
                        Expires {card.exp_month}/{card.exp_year}
                    </>
                ) : (
                    us_bank_account.account_type
                )}
            </TableCell>
            <TableCell>{primary ? '✔️' : ''}</TableCell>
            <TableCell>
                <Button size="small" variant="text" onClick={onDelete}>
                    Delete
                </Button>
                {!primary ? (
                    <Button size="small" variant="text" onClick={onPrimary}>
                        Make Primary
                    </Button>
                ) : null}
            </TableCell>
        </TableRow>
    );
};

interface PaymentFormProps {
    onSuccess?(id?: string): Promise<void> | void;
    onError?(msg: string): Promise<void> | void;
}

const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const { user } = Auth.useUser();
    const { email } = getUserDetails(user);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setLoading(true);
        elements.getElement('payment')?.update({ readOnly: true });
        try {
            const result = await stripe.confirmSetup({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            email,
                        },
                    },
                    return_url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                },
                redirect: 'if_required',
            });

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (result.error) {
                if (result.error.message) {
                    setError(result.error.message);
                }
                // Show error to your customer (for example, payment details incomplete)
                await onError?.(result.error.message ?? 'Something went wrong');
                elements.getElement('payment')?.update({ readOnly: false });
            } else {
                // Your customer will be redirected to your `return_url`. For some payment
                // methods like iDEAL, your customer will be redirected to an intermediate
                // site first to authorize the payment, then redirected to the `return_url`.
                await onSuccess?.(
                    result.setupIntent.payment_method?.toString()
                );
            }
        } finally {
            setLoading(false);
        }
    }, [elements, email, onError, onSuccess, stripe]);

    return (
        <>
            <DialogContent sx={{ overflowY: 'scroll' }}>
                <AddressElement
                    options={{
                        mode: 'billing',
                        defaultValues: { name: user?.user_metadata.full_name },
                        display: { name: 'organization' },
                    }}
                />
                <PaymentElement
                    options={{
                        fields: {
                            billingDetails: {
                                email: 'never',
                            },
                        },
                        defaultValues: {
                            billingDetails: {
                                name: user?.user_metadata.full_name,
                            },
                        },
                    }}
                />
            </DialogContent>
            <DialogActions>
                {error ? (
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'red',
                            flex: 1,
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        {error}
                    </Typography>
                ) : null}
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={13} /> : 'Submit'}
                </Button>
            </DialogActions>
        </>
    );
};

const Billing = () => {
    usePageTitle({
        header: authenticatedRoutes.admin.billing.title,
        headerLink: 'https://estuary.dev',
    });

    const tenants = useTenants();
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
        if (tenants.tenants.length === 1) {
            setSelectedTenant(tenants.tenants[0].tenant);
        }
    }, [tenants.tenants]);

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
        <>
            <AdminTabs />
            <Box sx={{ padding: 1 }}>
                <Stack direction="column" spacing={2} sx={{ m: 2 }}>
                    <Typography
                        component="span"
                        variant="h6"
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <FormattedMessage id="billing.header" />
                    </Typography>

                    <MessageWithLink messageID="billing.description" />

                    <Divider />

                    {tenants.tenants.length > 1 ? (
                        <FormControl fullWidth>
                            <InputLabel>Tenant</InputLabel>
                            <Select
                                label="Tenant"
                                value={selectedTenant ?? ''}
                                onChange={(evt) =>
                                    setSelectedTenant(evt.target.value)
                                }
                            >
                                {tenants.tenants
                                    .filter((t) =>
                                        grants.combinedGrants.find(
                                            (g) => g.object_role === t.tenant
                                        )
                                    )
                                    .map((tenant) => (
                                        <MenuItem
                                            key={tenant.id}
                                            value={tenant.tenant}
                                        >
                                            {tenant.tenant}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    ) : null}

                    {selectedTenant && methods.length > 0 && !methodsLoading ? (
                        <TableContainer>
                            <Table
                                sx={{ minWidth: 650 }}
                                aria-label="simple table"
                                size="small"
                            >
                                <TableHead>
                                    <TableRow>
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
                                            primary={
                                                method.id === defaultSource
                                            }
                                        />
                                    ))}
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

                    <Button
                        sx={{ marginTop: 1 }}
                        onClick={() => setNewMethodOpen(true)}
                    >
                        Add Payment Method
                    </Button>

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
            </Box>
        </>
    );
};

export default Billing;
