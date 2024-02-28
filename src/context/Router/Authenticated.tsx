import AppLayout from 'app/Layout';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import AuthenticatedHydrators from 'context/AuthenticatedHydrators';
import MarketplaceVerification from 'context/MarketplaceVerification';
import OnLoadSpinner from 'context/OnLoadSpinner/OnLoadSpinner';
import PaymentMethodWarning from 'context/PaymentMethodWarning';

function Authenticated() {
    return (
        <AuthenticatedOnlyContext>
            <AuthenticatedHydrators>
                <OnLoadSpinner display={false}>
                    <MarketplaceVerification>
                        <PaymentMethodWarning>
                            <AppLayout />
                        </PaymentMethodWarning>
                    </MarketplaceVerification>
                </OnLoadSpinner>
            </AuthenticatedHydrators>
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
