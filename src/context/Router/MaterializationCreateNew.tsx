import { authenticatedRoutes } from 'app/routes';
import MaterializationCreate from 'components/materialization/Create';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'components/shared/guards/ConnectorSelected';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

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
