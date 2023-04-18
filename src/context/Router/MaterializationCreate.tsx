import MaterializationCreateConfig from 'components/materialization/Create/Config';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';

function MaterializationCreateRoute() {
    return (
        <EntityContextProvider value="materialization">
            <WorkflowContextProvider value="materialization_create">
                <MaterializationCreateConfig />
            </WorkflowContextProvider>
        </EntityContextProvider>
    );
}

export default MaterializationCreateRoute;
