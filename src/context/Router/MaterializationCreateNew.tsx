import MaterializationCreate from 'components/materialization/Create';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function MaterializationCreateNewRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <AdminCapabilityGuard>
                    <MaterializationCreate />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateNewRoute;
