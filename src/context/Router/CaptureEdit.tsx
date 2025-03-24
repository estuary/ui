import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import CaptureEdit from 'components/capture/Edit';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureEditRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_edit">
                <EntityExistenceGuard>
                    <AdminCapabilityGuard>
                        <CaptureEdit />
                    </AdminCapabilityGuard>
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureEditRoute;
