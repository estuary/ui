import DerivationCreateConfig from 'components/derivation/Create/Config';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CollectionCreateRoute() {
    return (
        <EntityContextProvider value="collection">
            <WorkflowContextProvider value="collection_create">
                <DerivationCreateConfig />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CollectionCreateRoute;
