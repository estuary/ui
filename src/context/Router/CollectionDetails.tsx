import CollectionDetails from 'components/collection/Details';
import type { Pages } from 'components/shared/Entity/Details/context';
import { DetailsPageContextProvider } from 'components/shared/Entity/Details/context';

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
