import { createContext, useContext } from 'react';
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
    const context = useContext(WorkflowContext);

    if (context === null) {
        throw new Error(
            'useEntityWorkflow must be used within a WorkflowContextProvider'
        );
    }

    return context;
};

export { WorkflowContextProvider, useEntityWorkflow };
