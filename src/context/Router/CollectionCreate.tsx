import DerivationCreateConfig from 'components/derivation/Create/Config';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CollectionCreateRoute() {
    return (
        <EntityContextProvider value="collection">
            <WorkflowContextProvider value="collection_create">
                <AdminCapabilityGuard>
                    <DerivationCreateConfig />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CollectionCreateRoute;
