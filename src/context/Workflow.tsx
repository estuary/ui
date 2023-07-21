import { createContext, useContext, useMemo } from 'react';

import { BaseComponentProps, EntityWorkflow as Workflow } from 'types';

interface Props extends BaseComponentProps {
    value: Workflow;
}

const WorkflowContext = createContext<Workflow | null>(null);

const WorkflowContextProvider = ({ children, value }: Props) => {
    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
};

const useEntityWorkflow = () => {
    return useContext(WorkflowContext);
};

const useEntityWorkflow_Editing = () => {
    const workflow = useContext(WorkflowContext);
    return useMemo(
        () =>
            workflow === 'capture_edit' || workflow === 'materialization_edit',
        [workflow]
    );
};

export {
    WorkflowContextProvider,
    useEntityWorkflow,
    useEntityWorkflow_Editing,
};
