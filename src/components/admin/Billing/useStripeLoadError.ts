import { useCallback, useEffect, useState } from 'react';

import { getStripe } from 'src/components/admin/Billing/stripe';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

// Stripe's forms report their own load failures, but a failed Stripe.js load never mounts them.
export function useStripeLoadError() {
    const [loadError, setLoadError] = useState(false);

    const onLoadError = useCallback((formName: string) => {
        setLoadError(true);
        logRocketEvent(CustomEvents.STRIPE_FORM_LOADING_FAILED, { formName });
    }, []);

    useEffect(() => {
        void getStripe().catch(() => onLoadError('stripe.js'));
    }, [onLoadError]);

    return { loadError, onLoadError };
}
