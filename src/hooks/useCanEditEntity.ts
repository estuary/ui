import { useMemo } from 'react';

import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore_capabilities_writable } from 'src/stores/Entities/hooks';

function useCanEditEntity() {
    const isEdit = useEntityWorkflow_Editing();

    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );

    const grants = useEntitiesStore_capabilities_writable();

    return useMemo(
        () =>
            isEdit && entityName && grants && grants.length > 0
                ? Boolean(grants.some((grant) => entityName.startsWith(grant)))
                : null,
        [entityName, isEdit, grants]
    );
}

export default useCanEditEntity;
