import EntityExistenceGuard from 'src/app/guards/EntityExistenceGuard';
import MaterializationEdit from 'src/components/materialization/Edit';
import StoreCleaner from 'src/components/shared/Entity/StoreCleaner';
import { EntityContextProvider } from 'src/context/EntityContext';
import { WorkflowContextProvider } from 'src/context/Workflow';

function MaterializationEditRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_edit">
                <EntityExistenceGuard>
                    <StoreCleaner>
                        <MaterializationEdit />
                    </StoreCleaner>
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationEditRoute;
