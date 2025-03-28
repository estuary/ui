import type { Pages } from 'src/components/shared/Entity/Details/context';

import CaptureDetails from 'src/components/capture/Details';
import { DetailsPageContextProvider } from 'src/components/shared/Entity/Details/context';

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
