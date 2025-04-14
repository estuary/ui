import { authenticatedRoutes } from 'src/app/routes';
import CaptureExpressCreate from 'src/components/capture/CreateExpress';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'src/components/shared/guards/ConnectorSelected';
import AuthenticatedHydrators from 'src/context/AuthenticatedHydrators';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { ExpressWorkflowWrapper } from 'src/pages/expressWorkflow/Wrapper';

const ExpressCaptureCreateNewRoute = () => {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AuthenticatedHydrators>
                    <AdminCapabilityGuard>
                        <ConnectorSelectedGuard
                            navigateToPath={
                                authenticatedRoutes.express.captureCreate
                                    .fullPath
                            }
                        >
                            <ExpressWorkflowWrapper>
                                <CaptureExpressCreate />
                            </ExpressWorkflowWrapper>
                        </ConnectorSelectedGuard>
                    </AdminCapabilityGuard>
                </AuthenticatedHydrators>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
};

export default ExpressCaptureCreateNewRoute;
