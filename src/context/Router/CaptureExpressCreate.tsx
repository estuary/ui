import CaptureExpressCreateConfig from 'src/components/capture/CreateExpress/Config';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

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
