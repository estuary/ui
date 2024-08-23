import { authenticatedRoutes } from 'app/routes';
import CaptureCreate from 'components/capture/Create';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'components/shared/guards/ConnectorSelected';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureCreateNewRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <ConnectorSelectedGuard
                        navigateToPath={
                            authenticatedRoutes.captures.create.fullPath
                        }
                    >
                        <CaptureCreate />
                    </ConnectorSelectedGuard>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureCreateNewRoute;
