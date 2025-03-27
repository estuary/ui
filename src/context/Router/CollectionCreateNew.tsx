import DerivationCreateAlternate from 'src/components/derivation/Create/CreateAlternate';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

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
