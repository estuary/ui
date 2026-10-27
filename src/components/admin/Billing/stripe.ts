import type {
    Appearance,
    Stripe,
    StripeAddressElementOptions,
} from '@stripe/stripe-js';
import type { StripeAddress } from 'src/utils/billing-contact-utils';

import { useTheme } from '@mui/material';

import { loadStripe } from '@stripe/stripe-js';

export const stripeFieldBackgroundDark = 'rgba(247, 249, 252, 0.05)';
const flatField = { border: 'none', boxShadow: 'none' };

export const STRIPE_LOAD_ERROR =
    'Unable to load the forms from Stripe. Try again and if the issue persists please contact support.';

let stripePromise: Promise<Stripe | null> | null = null;

// Load Stripe.js once per page.
export function getStripe() {
    stripePromise ??= loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
    );
    return stripePromise;
}

export const billingAddressOptions = (
    name: string,
    address: Partial<StripeAddress>
): StripeAddressElementOptions => ({
    mode: 'billing',
    display: { name: 'organization' },
    defaultValues: {
        name,
        address: { ...address, country: address.country ?? '' },
    },
});

export function useStripeAppearance(): Appearance {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return {
        theme: isDark ? 'night' : 'stripe',
        variables: {
            colorPrimary: theme.palette.primary.main,
            fontFamily: theme.typography.fontFamily,
            borderRadius:
                typeof theme.shape.borderRadius === 'number'
                    ? `${theme.shape.borderRadius * 3}px`
                    : `calc(3 * ${theme.shape.borderRadius})`,
            focusBoxShadow: 'none',
            focusOutline: `2px solid ${theme.palette.primary.main}`,
        },
        ...(isDark && {
            rules: {
                '.Input': {
                    ...flatField,
                    backgroundColor: stripeFieldBackgroundDark,
                },
                '.Tab': {
                    ...flatField,
                    backgroundColor: stripeFieldBackgroundDark,
                },
                '.Tab--focused': {
                    borderColor: theme.palette.primary.main,
                },
                '.Block': {
                    ...flatField,
                    padding: '14px',
                    backgroundColor: stripeFieldBackgroundDark,
                },
                '.PickerItem': {
                    ...flatField,
                    backgroundColor: stripeFieldBackgroundDark,
                },
            },
        }),
    };
}
