import Authenticated from './Authenticated';

import AppLayout from 'src/app/Layout';

function AuthenticatedLayout() {
    return (
        <Authenticated>
            <AppLayout />
        </Authenticated>
    );
}

export default AuthenticatedLayout;
