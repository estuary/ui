import { authenticatedRoutes } from 'src/app/routes';
import CaptureExpressCreate from 'src/components/capture/CreateExpress';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import ConnectorSelectedGuard from 'src/components/shared/guards/ConnectorSelected';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { ExpressWorkflowWrapper } from 'src/pages/expressWorkflow/Wrapper';

function CaptureExpressCreateNewRoute() {
    return (
        <EntityContextProvider value="capture">
            <WorkflowContextProvider value="capture_create">
                <AdminCapabilityGuard>
                    <ConnectorSelectedGuard
                        navigateToPath={
                            authenticatedRoutes.express.captureCreate.fullPath
                        }
                    >
                        <ExpressWorkflowWrapper>
                            <CaptureExpressCreate />
                        </ExpressWorkflowWrapper>
                    </ConnectorSelectedGuard>
                </AdminCapabilityGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default CaptureExpressCreateNewRoute;
