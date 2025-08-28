import DerivationCreateConfig from 'src/components/derivation/Create/Config';
import StoreCleaner from 'src/components/shared/Entity/StoreCleaner';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function CollectionCreateRoute() {
    return (
        <EntityContextProvider value="collection">
            <WorkflowContextProvider value="collection_create">
                <AdminCapabilityGuard>
                    <StoreCleaner>
                        <DerivationCreateConfig />
                    </StoreCleaner>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CollectionCreateRoute;
