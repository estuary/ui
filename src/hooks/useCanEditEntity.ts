import { useShallow } from 'zustand/react/shallow';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEntitiesStore } from 'stores/Entities/Store';

function useCanEditEntity() {
    const isEdit = useEntityWorkflow_Editing();

    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );

    return useEntitiesStore(
        useShallow((state) => {
            if (!entityName || !isEdit) {
                return null;
            }

            return Boolean(
                [...state.capabilities.admin, ...state.capabilities.write].find(
                    (capability) => {
                        console.log('capability > ', capability);
                        return entityName.includes(capability);
                    }
                )
            );
        })
    );
}

export default useCanEditEntity;
