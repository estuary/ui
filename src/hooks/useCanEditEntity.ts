import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useMemo } from 'react';
import { useEntitiesStore_capabilities_writeable } from 'stores/Entities/hooks';

function useCanEditEntity() {
    const isEdit = useEntityWorkflow_Editing();

    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );

    const grants = useEntitiesStore_capabilities_writeable();

    return useMemo(
        () =>
            isEdit && entityName
                ? Boolean(grants.some((grant) => entityName.startsWith(grant)))
                : null,
        [entityName, isEdit, grants]
    );
}

export default useCanEditEntity;
