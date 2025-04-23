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
                                <ExpressWorkflowGuard>
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
