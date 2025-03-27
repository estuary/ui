import CaptureExpressCreateConfig from 'components/capture/CreateExpress/Config';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureExpressCreateRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <CaptureExpressCreateConfig />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureExpressCreateRoute;
