import type { BaseComponentProps } from 'src/types';

import useTenantMissingPaymentMethodWarning from 'src/hooks/billing/useTenantMissingPaymentMethodWarning';

function PaymentMethodWarning({ children }: BaseComponentProps) {
    useTenantMissingPaymentMethodWarning();

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default PaymentMethodWarning;
