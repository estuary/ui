import { useDetailsPage } from './context';
import History from './History';
import Overview from './Overview';
import Spec from './Spec';

function RenderTab() {
    const page = useDetailsPage();

    if (page === 'spec') {
        return <Spec />;
    }

    if (page === 'history') {
        return <History />;
    }

    return <Overview />;
}

export default RenderTab;
