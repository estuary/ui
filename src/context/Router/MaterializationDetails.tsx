import type { Pages } from 'src/components/shared/Entity/Details/context';

import MaterializationDetails from 'src/components/materialization/Details';
import { DetailsPageContextProvider } from 'src/components/shared/Entity/Details/context';

interface Props {
    tab: Pages;
}

function MaterializationDetailsRoute({ tab }: Props) {
    return (
        <DetailsPageContextProvider value={tab}>
            <MaterializationDetails />
        </DetailsPageContextProvider>
    );
}

export default MaterializationDetailsRoute;
