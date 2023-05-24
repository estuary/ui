import AppLayout from 'app/Layout';
import { AuthenticatedOnlyContext } from 'context/Authenticated';

function Authenticated() {
    return (
        <AuthenticatedOnlyContext>
            <AppLayout />
        </AuthenticatedOnlyContext>
    );
}

export default Authenticated;
