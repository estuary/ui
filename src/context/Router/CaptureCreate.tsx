import CaptureCreateConfig from 'components/capture/Create/Config';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function CaptureCreateRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <CaptureCreateConfig />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureCreateRoute;
