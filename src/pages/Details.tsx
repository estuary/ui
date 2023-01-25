import { authenticatedRoutes } from 'app/routes';
import PageContainer from 'components/shared/PageContainer';
import useGlobalSearchParams from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';

function Details() {
    useBrowserTitle('browserTitle.admin');
    const catalogName = useGlobalSearchParams();

    console.log('catalogName ', catalogName);

    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.details.title }}
        >
            This is the details page here
        </PageContainer>
    );
}

export default Details;
