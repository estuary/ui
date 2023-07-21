import CaptureCreate from 'components/capture/Create';

import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

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
