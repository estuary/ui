import MaterializationCreateConfig from 'src/components/materialization/Create/Config';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function MaterializationCreateRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <AdminCapabilityGuard>
                    <MaterializationCreateConfig />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateRoute;
