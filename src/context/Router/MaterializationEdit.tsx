import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import MaterializationEdit from 'components/materialization/Edit';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { ConnectorsHydrator } from 'stores/Connectors/Hydrator';

function MaterializationEditRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_edit">
                <EntityExistenceGuard>
                    <ConnectorsHydrator>
                        <MaterializationEdit />
                    </ConnectorsHydrator>
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationEditRoute;
