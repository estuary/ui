import MaterializationCreateConfig from 'src/components/materialization/Create/Config';
import StoreCleaner from 'src/components/shared/Entity/StoreCleaner';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function MaterializationCreateRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <AdminCapabilityGuard>
                    <StoreCleaner>
                        <MaterializationCreateConfig />
                    </StoreCleaner>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateRoute;
