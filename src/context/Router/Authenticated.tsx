import AppLayout from 'app/Layout';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import AuthenticatedHydrators from 'context/AuthenticatedHydrators';
import OnLoadSpinner from 'context/OnLoadSpinner/OnLoadSpinner';
import PaymentMethodWarning from 'context/PaymentMethodWarning';

function Authenticated() {
    return (
        <AuthenticatedOnlyContext>
            <AuthenticatedHydrators>
                <OnLoadSpinner display={false}>
                    <PaymentMethodWarning>
                        <AppLayout />
                    </PaymentMethodWarning>
                </OnLoadSpinner>
            </AuthenticatedHydrators>
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
