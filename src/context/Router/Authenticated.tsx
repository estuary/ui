import AppLayout from 'app/Layout';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import AuthenticatedHydrators from 'context/AuthenticatedHydrators';
import OnLoadSpinner from 'context/OnLoadSpinner/OnLoadSpinner';

function Authenticated() {
    return (
        <AuthenticatedOnlyContext>
            <AuthenticatedHydrators>
                <OnLoadSpinner display={false}>
                    <AppLayout />
                </OnLoadSpinner>
            </AuthenticatedHydrators>
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
