import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import CaptureEdit from 'components/capture/Edit';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { ConnectorsHydrator } from 'stores/Connectors/Hydrator';

function CaptureEditRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_edit">
                <EntityExistenceGuard>
                    <ConnectorsHydrator>
                        <CaptureEdit />
                    </ConnectorsHydrator>
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureEditRoute;
