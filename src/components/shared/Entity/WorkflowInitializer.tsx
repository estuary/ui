
import { Fragment } from 'react';


import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';
import type { WorkflowInitializerProps } from 'src/components/shared/Entity/types';
import DraftInitializer from 'src/components/shared/Entity/Edit/DraftInitializer';

const WorkflowInitializer = ({
    children,
    expressWorkflow,
}: WorkflowInitializerProps) => {
    const isEdit = useEntityWorkflow_Editing();
    const InitializerComponent = isEdit ? DraftInitializer : Fragment;

    return (
        <InitializerComponent>
            <WorkflowHydrator expressWorkflow={expressWorkflow}>
                {children}
            </WorkflowHydrator>
        </InitializerComponent>
    );
};

export default WorkflowInitializer;
