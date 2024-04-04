import History from './History';
import Ops from './Ops';
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

        case 'ops':
            return <Ops />;

        default:
            return <Overview />;
    }
}

export default RenderTab;
