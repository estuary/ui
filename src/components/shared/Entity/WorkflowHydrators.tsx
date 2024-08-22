import { useEntityWorkflow_Editing } from 'context/Workflow';
import { Fragment } from 'react';
import BindingHydrator from 'stores/Binding/Hydrator';
import ConnectorHydrator from 'stores/Connector/Hydrator';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import { BaseComponentProps } from 'types';
import DraftInitializer from './Edit/DraftInitializer';

function WorkflowHydrators({ children }: BaseComponentProps) {
    const isEdit = useEntityWorkflow_Editing();
    const InitializerComponent = isEdit ? DraftInitializer : Fragment;

    return (
        <InitializerComponent>
            <DetailsFormHydrator>
                <ConnectorHydrator>
                    <EndpointConfigHydrator>
                        <BindingHydrator>{children}</BindingHydrator>
                    </EndpointConfigHydrator>
                </ConnectorHydrator>
            </DetailsFormHydrator>
        </InitializerComponent>
    );
}

export default WorkflowHydrators;
