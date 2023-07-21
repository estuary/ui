import DerivationCreateAlternate from 'components/derivation/Create/CreateAlternate';

import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CollectionCreateNewRoute() {
    return (
        <EntityContextProvider value="collection">
            <WorkflowContextProvider value="collection_create">
                <DerivationCreateAlternate />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CollectionCreateNewRoute;
