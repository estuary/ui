import { authenticatedRoutes } from 'app/Authenticated';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';

const Admin = () => {
    useBrowserTitle('browserTitle.admin');

    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.admin.title }}
        >
            <AdminTabs selectedTab={0} />
        </PageContainer>
    );
};

export default Admin;
