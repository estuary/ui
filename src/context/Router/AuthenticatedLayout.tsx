import AppLayout from 'app/Layout';
import Authenticated from './Authenticated';

function AuthenticatedLayout() {
    return (
        <Authenticated>
            <AppLayout />
        </Authenticated>
    );
}

export default AuthenticatedLayout;
