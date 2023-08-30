import DerivationCreateAlternate from 'components/derivation/Create/CreateAlternate';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CollectionCreateNewRoute() {
    return (
        <EntityContextProvider value="collection">
            <WorkflowContextProvider value="collection_create">
                <AdminCapabilityGuard>
                    <DerivationCreateAlternate />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CollectionCreateNewRoute;
