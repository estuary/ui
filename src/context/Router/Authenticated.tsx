import AppLayout from 'app/Layout';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import AuthenticatedHydrators from 'context/AuthenticatedHydrators';

function Authenticated() {
    return (
        <AuthenticatedOnlyContext>
            <AuthenticatedHydrators>
                <AppLayout />
            </AuthenticatedHydrators>
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
