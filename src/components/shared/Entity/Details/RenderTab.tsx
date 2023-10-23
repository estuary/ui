import History from './History';
import Overview from './Overview';
import Settings from './Settings';
import Spec from './Spec';
import { useDetailsPage } from './context';

interface Props {
    isDerivation: boolean;
}

function RenderTab({ isDerivation }: Props) {
    const page = useDetailsPage();

    switch (page) {
        case 'spec':
            return <Spec />;

        case 'settings':
            return <Settings />;

        case 'history':
            return <History />;

        default:
            return <Overview isDerivation={isDerivation} />;
    }
}

export default RenderTab;
