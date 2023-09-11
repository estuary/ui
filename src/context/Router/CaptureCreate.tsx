import CaptureCreateConfig from 'components/capture/Create/Config';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureCreateRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <CaptureCreateConfig />
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureCreateRoute;
