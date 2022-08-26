import { authenticatedRoutes } from 'app/Authenticated';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import AccessGrantsTable from 'components/tables/AccessGrants';
import useBrowserTitle from 'hooks/useBrowserTitle';

function AccessGrants() {
    useBrowserTitle('browserTitle.admin.accessGrants');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.accressGrants.title,
            }}
        >
            <AdminTabs selectedTab={0} />
            <AccessGrantsTable />
        </PageContainer>
    );
}

export default AccessGrants;
