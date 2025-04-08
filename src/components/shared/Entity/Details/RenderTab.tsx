import { useDetailsPage } from 'src/components/shared/Entity/Details/context';
import History from 'src/components/shared/Entity/Details/History';
import Ops from 'src/components/shared/Entity/Details/Ops';
import Overview from 'src/components/shared/Entity/Details/Overview';
import Spec from 'src/components/shared/Entity/Details/Spec';
import Status from 'src/components/shared/Entity/Details/Status';

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
