import { useNavigate } from 'react-router-dom';
import { useMount } from 'react-use';

import { authenticatedRoutes } from 'app/routes';

// TODO (Admin dash) this page is not used right now and we just load access grants since it is
//  the first tab. Eventually we might make this a dashboard page to land on... so leaving it in
const Admin = () => {
    const navigate = useNavigate();
    useMount(() => {
        navigate(authenticatedRoutes.admin.accessGrants.fullPath, {
            replace: true,
        });
    });

    return null;
};

export default Admin;
