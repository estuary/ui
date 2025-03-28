import { authenticatedRoutes } from 'src/app/routes';
import MaterializationCreate from 'src/components/materialization/Create';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'src/components/shared/guards/ConnectorSelected';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function MaterializationCreateNewRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <AdminCapabilityGuard>
                    <ConnectorSelectedGuard
                        navigateToPath={
                            authenticatedRoutes.materializations.create.fullPath
                        }
                    >
                        <MaterializationCreate />
                    </ConnectorSelectedGuard>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateNewRoute;
