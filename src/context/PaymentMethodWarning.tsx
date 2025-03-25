import type { BaseComponentProps } from 'types';
import useTenantMissingPaymentMethodWarning from 'hooks/billing/useTenantMissingPaymentMethodWarning';

function PaymentMethodWarning({ children }: BaseComponentProps) {
    useTenantMissingPaymentMethodWarning();

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default PaymentMethodWarning;
