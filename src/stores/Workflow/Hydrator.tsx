import type { BaseComponentProps } from 'src/types';

import { Fragment } from 'react';

import DraftInitializer from 'src/components/shared/Entity/Edit/DraftInitializer';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import BindingHydrator from 'src/stores/Binding/Hydrator';
import { DetailsFormHydrator } from 'src/stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'src/stores/EndpointConfig/Hydrator';

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
