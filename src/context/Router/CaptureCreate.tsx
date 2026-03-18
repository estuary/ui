import CaptureCreateConfig from 'src/components/capture/Create/Config';
import StoreCleaner from 'src/components/shared/Entity/StoreCleaner';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function CaptureCreateRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <StoreCleaner>
                        <CaptureCreateConfig />
                    </StoreCleaner>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureCreateRoute;
