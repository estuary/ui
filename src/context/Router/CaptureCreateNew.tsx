import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import CaptureCreate from './CaptureCreate';

function CaptureCreateNewRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <CaptureCreate />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureCreateNewRoute;
