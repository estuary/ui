import { ExpressWorkflowGuard } from 'src/app/guards/ExpressWorkflowGuard/index';
import ExpressCaptureCreateConfig from 'src/components/capture/ExpressCreate/Config';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import AuthenticatedHydrators from 'src/context/AuthenticatedHydrators';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { ExpressWorkflowWrapper } from 'src/pages/expressWorkflow/Wrapper';

const ExpressCaptureCreateRoute = () => {
    return (
        <AuthenticatedHydrators>
            <EntityContextProvider value="capture">
                <WorkflowContextProvider value="capture_create">
                    <AdminCapabilityGuard>
                        <ExpressWorkflowWrapper>
                            <ExpressWorkflowGuard>
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
