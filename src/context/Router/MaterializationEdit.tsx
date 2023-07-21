import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';

import MaterializationEdit from 'components/materialization/Edit';

import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function MaterializationEditRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_edit">
                <EntityExistenceGuard>
                    <MaterializationEdit />
                </EntityExistenceGuard>
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationEditRoute;
