import { authenticatedRoutes } from 'src/app/routes';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    return <CapturesTable />;
};

export default Capture;
