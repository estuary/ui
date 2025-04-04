import type { WorkflowInitializerProps } from './types';

import { Fragment } from 'react';

import DraftInitializer from './Edit/DraftInitializer';

import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';

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
