import { authenticatedRoutes } from 'app/routes';
import CaptureExpressCreate from 'components/capture/CreateExpress';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'components/shared/guards/ConnectorSelected';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureExpressCreateNewRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <ConnectorSelectedGuard
                        navigateToPath={
                            authenticatedRoutes.captures.createExpress.fullPath
                        }
                    >
                        <CaptureExpressCreate />
                    </ConnectorSelectedGuard>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureExpressCreateNewRoute;
