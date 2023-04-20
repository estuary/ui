import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import CaptureEdit from 'components/capture/Edit';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureEditRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_edit">
                <EntityExistenceGuard>
                    <CaptureEdit />
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureEditRoute;
