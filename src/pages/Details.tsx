import { authenticatedRoutes } from 'app/routes';
import PageContainer from 'components/shared/PageContainer';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';

function Details() {
    useBrowserTitle('browserTitle.admin');
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.details.title }}
        >
            {catalogName}
        </PageContainer>
    );
}

export default Details;
