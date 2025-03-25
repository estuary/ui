import MaterializationDetails from 'components/materialization/Details';
import type { Pages } from 'components/shared/Entity/Details/context';
import { DetailsPageContextProvider } from 'components/shared/Entity/Details/context';

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
