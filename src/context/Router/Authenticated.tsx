import { AuthenticatedOnlyContext } from 'src/context/Authenticated';
import AuthenticatedHydrators from 'src/context/AuthenticatedHydrators';
import OnLoadSpinner from 'src/context/OnLoadSpinner/OnLoadSpinner';
import PaymentMethodWarning from 'src/context/PaymentMethodWarning';
import type { BaseComponentProps } from 'src/types';

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
