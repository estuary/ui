import History from './History';
import Overview from './Overview';
import Spec from './Spec';
import { useDetailsPage } from './context';

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
