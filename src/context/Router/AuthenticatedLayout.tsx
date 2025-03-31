import AppLayout from 'src/app/Layout';
import Authenticated from 'src/context/Router/Authenticated';

function AuthenticatedLayout() {
    return (
        <Authenticated>
            <AppLayout />
        </Authenticated>
    );
}

export default AuthenticatedLayout;
