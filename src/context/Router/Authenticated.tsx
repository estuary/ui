import type { BaseComponentProps } from 'types';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import AuthenticatedHydrators from 'context/AuthenticatedHydrators';
import OnLoadSpinner from 'context/OnLoadSpinner/OnLoadSpinner';
import PaymentMethodWarning from 'context/PaymentMethodWarning';

function Authenticated({ children }: BaseComponentProps) {
    return (
        <AuthenticatedOnlyContext>
            <AuthenticatedHydrators>
                <OnLoadSpinner display={false}>
                    <PaymentMethodWarning>{children}</PaymentMethodWarning>
                </OnLoadSpinner>
            </AuthenticatedHydrators>
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
