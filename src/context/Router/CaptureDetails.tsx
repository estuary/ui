import CaptureDetails from 'components/capture/Details';
import type { Pages } from 'components/shared/Entity/Details/context';
import { DetailsPageContextProvider } from 'components/shared/Entity/Details/context';

interface Props {
    tab: Pages;
}

function CaptureDetailsRoute({ tab }: Props) {
    return (
        <DetailsPageContextProvider value={tab}>
            <CaptureDetails />
        </DetailsPageContextProvider>
    );
}

export default CaptureDetailsRoute;
