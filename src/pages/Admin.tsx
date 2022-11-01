import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

// TODO (Admin dash) this page is not used right now and we just load access grants since it is
//  the first tab. Eventually we might make this a dashboard page to land on... so leaving it in
const Admin = () => {
    const navigate = useNavigate();
    useEffectOnce(() =>
        navigate(authenticatedRoutes.admin.accessGrants.fullPath, {
            replace: true,
        })
    );

    useBrowserTitle('browserTitle.admin');
    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.admin.title }}
        >
            <AdminTabs />
        </PageContainer>
    );
};

export default Admin;
