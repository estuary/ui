import useTenantMissingPaymentMethodWarning from 'hooks/billing/useTenantMissingPaymentMethodWarning';
import { BaseComponentProps } from 'types';

function PaymentMethodWarning({ children }: BaseComponentProps) {
    useTenantMissingPaymentMethodWarning();

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default PaymentMethodWarning;
