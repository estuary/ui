import type { BaseComponentProps } from 'types';
import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { Fragment } from 'react';
import BindingHydrator from 'stores/Binding/Hydrator';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';

// This hydrator is here without a store so that we can start working on moving a lot of
//  these separate stores into a single "Workflow" store for Create and Edit.
function WorkflowHydrator({ children }: BaseComponentProps) {
    const isEdit = useEntityWorkflow_Editing();
    const InitializerComponent = isEdit ? DraftInitializer : Fragment;

    return (
        <InitializerComponent>
            <DetailsFormHydrator>
                <EndpointConfigHydrator>
                    <BindingHydrator>{children}</BindingHydrator>
                </EndpointConfigHydrator>
            </DetailsFormHydrator>
        </InitializerComponent>
    );
}

export default WorkflowHydrator;
