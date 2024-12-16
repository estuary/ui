import { useDetailsPage } from './context';
import History from './History';
import Status from './Logs/Status';
import Ops from './Ops';
import Overview from './Overview';
import Spec from './Spec';

function RenderTab() {
    const page = useDetailsPage();

    switch (page) {
        case 'spec':
            return <Spec />;

        case 'history':
            return <History />;

        case 'ops':
            return (
                <>
                    <Ops />

                    <Status />
                </>
            );

        default:
            return <Overview />;
    }
}

export default RenderTab;
