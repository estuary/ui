import MaterializationCreate from 'components/materialization/Create';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function MaterializationCreateNewRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <MaterializationCreate />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateNewRoute;
