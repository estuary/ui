import EntityExistenceGuard from 'src/app/guards/EntityExistenceGuard';
import CaptureEdit from 'src/components/capture/Edit';
import StoreCleaner from 'src/components/shared/Entity/StoreCleaner';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function CaptureEditRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_edit">
                <EntityExistenceGuard>
                    <StoreCleaner>
                        <CaptureEdit />
                    </StoreCleaner>
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureEditRoute;
