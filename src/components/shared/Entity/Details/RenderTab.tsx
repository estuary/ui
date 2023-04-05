import { useDetailsPage } from './context';
import History from './History';
import Overview from './Overview';
import Spec from './Spec';

function RenderTab() {
    const page = useDetailsPage();

    switch (page) {
        case 'spec':
            return <Spec />;

        case 'history':
            return <History />;

        default:
            return <Overview />;
    }
}

export default RenderTab;
