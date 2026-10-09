import type { Appearance, Stripe } from '@stripe/stripe-js';

import { useTheme } from '@mui/material';

import { loadStripe } from '@stripe/stripe-js';

import { stripePaymentFormFieldBackgroundDark } from 'src/context/Theme';

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

export function useStripeAppearance(): Appearance {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return {
        theme: isDark ? 'night' : 'stripe',
        variables: {
            colorPrimary: theme.palette.primary.main,
            fontFamily: theme.typography.fontFamily,
            borderRadius: `6px`,
            focusBoxShadow: 'none',
            focusOutline: 'none',
        },
        ...(isDark && {
            rules: {
                '.Input': {
                    ...flatField,
                    backgroundColor: stripePaymentFormFieldBackgroundDark,
                },
                '.Tab': {
                    ...flatField,
                    backgroundColor: stripePaymentFormFieldBackgroundDark,
                },
                '.Tab--focused': {
                    borderColor: theme.palette.primary.main,
                },
                '.Block': {
                    ...flatField,
                    padding: '14px',
                    backgroundColor: stripePaymentFormFieldBackgroundDark,
                },
                '.PickerItem': {
                    ...flatField,
                    backgroundColor: stripePaymentFormFieldBackgroundDark,
                },
            },
        }),
    };
}
