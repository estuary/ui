import type { BaseComponentProps, EntityWorkflow as Workflow } from 'src/types';

import { createContext, useContext, useMemo } from 'react';

interface Props extends BaseComponentProps {
    value: Workflow;
}

const WorkflowContext = createContext<Workflow | null>(null);

export const WorkflowContextProvider = ({ children, value }: Props) => {
    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
};

export const useEntityWorkflow = () => {
    return useContext(WorkflowContext);
};

export const useEntityWorkflow_Creating = () => {
    const workflow = useContext(WorkflowContext);
    return useMemo(
        () =>
            workflow === 'capture_create' ||
            workflow === 'materialization_create',
        [workflow]
    );
};

export const useEntityWorkflow_Editing = () => {
    const workflow = useContext(WorkflowContext);
    return useMemo(
        () =>
            workflow === 'capture_edit' || workflow === 'materialization_edit',
        [workflow]
    );
};
