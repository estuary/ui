import { useRef } from 'react';

import { useUnmount } from 'react-use';

import { ExpressWorkflowGuard } from 'src/app/guards/ExpressWorkflowGuard/index';
import { authenticatedRoutes } from 'src/app/routes';
import ExpressCaptureCreate from 'src/components/capture/ExpressCreate';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'src/components/shared/guards/ConnectorSelected';
import AuthenticatedHydrators from 'src/context/AuthenticatedHydrators';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { ExpressWorkflowWrapper } from 'src/pages/expressWorkflow/Wrapper';

const ExpressCaptureCreateNewRoute = () => {
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
                        <ConnectorSelectedGuard
                            navigateToPath={
                                authenticatedRoutes.express.captureCreate
                                    .fullPath
                            }
                        >
                            <ExpressWorkflowWrapper>
                                <ExpressWorkflowGuard
                                    authenticating={authenticatingWorkflow}
                                >
                                    <ExpressCaptureCreate />
                                </ExpressWorkflowGuard>
                            </ExpressWorkflowWrapper>
                        </ConnectorSelectedGuard>
                    </AdminCapabilityGuard>
                </WorkflowContextProvider>
            </EntityContextProvider>
        </AuthenticatedHydrators>
    );
};

export default ExpressCaptureCreateNewRoute;
