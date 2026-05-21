import { authenticatedRoutes } from 'src/app/routes';
import MaterializationsTable from 'src/components/tables/Materializations';
import usePageTitle from 'src/hooks/usePageTitle';

const Materializations = () => {
    usePageTitle({
        header: authenticatedRoutes.materializations.title,
        headerLink: 'https://docs.estuary.dev/concepts/#materializations',
    });

    return <MaterializationsTable />;
};

export default Materializations;
