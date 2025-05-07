import { useRef } from 'react';

import { useUnmount } from 'react-use';

import { ExpressWorkflowGuard } from 'src/app/guards/ExpressWorkflowGuard/index';
import ExpressCaptureCreateConfig from 'src/components/capture/ExpressCreate/Config';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import AuthenticatedHydrators from 'src/context/AuthenticatedHydrators';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { ExpressWorkflowWrapper } from 'src/pages/expressWorkflow/Wrapper';

const ExpressCaptureCreateRoute = () => {
    // TODO: Move the ref to a higher component so that all express workflow routes
    //   access the same ref.
    const authenticatingWorkflow = useRef(false);

    useUnmount(() => {
        authenticatingWorkflow.current = false;
    });

    return (
        <AuthenticatedHydrators>
            <EntityContextProvider value="capture">
                <WorkflowContextProvider value="capture_create">
                    <AdminCapabilityGuard>
                        <ExpressWorkflowWrapper>
                            <ExpressWorkflowGuard
                                authenticating={authenticatingWorkflow}
                            >
                                <ExpressCaptureCreateConfig />
                            </ExpressWorkflowGuard>
                        </ExpressWorkflowWrapper>
                    </AdminCapabilityGuard>
                </WorkflowContextProvider>
            </EntityContextProvider>
        </AuthenticatedHydrators>
    );
};

export default ExpressCaptureCreateRoute;
