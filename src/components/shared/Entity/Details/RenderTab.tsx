import EntityAlerts from 'src/components/shared/Entity/Alerts';
import { useDetailsPage } from 'src/components/shared/Entity/Details/context';
import { DataFlow } from 'src/components/shared/Entity/Details/DataFlow';
import History from 'src/components/shared/Entity/Details/History';
import Status from 'src/components/shared/Entity/Details/Logs/Status';
import Ops from 'src/components/shared/Entity/Details/Ops';
import Overview from 'src/components/shared/Entity/Details/Overview';
import Spec from 'src/components/shared/Entity/Details/Spec';

function RenderTab() {
    const page = useDetailsPage();

    switch (page) {
        case 'spec':
            return <Spec />;

        case 'history':
            return <History />;

        case 'dataFlow':
            return <DataFlow />;

        case 'alerts':
            return <EntityAlerts />;

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
