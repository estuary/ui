import type { Pages } from 'src/components/shared/Entity/Details/context';

import CollectionDetails from 'src/components/collection/Details';
import { DetailsPageContextProvider } from 'src/components/shared/Entity/Details/context';

interface Props {
    tab: Pages;
}

function CollectionDetailsRoute({ tab }: Props) {
    return (
        <DetailsPageContextProvider value={tab}>
            <CollectionDetails />
        </DetailsPageContextProvider>
    );
}

export default CollectionDetailsRoute;
