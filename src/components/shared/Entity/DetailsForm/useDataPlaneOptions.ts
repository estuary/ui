import { useMemo } from 'react';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useDataPlaneOptions = () => {
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const storageMappings = useEntitiesStore((state) => state.storageMappings);
    const selectedTenant = useWorkflowStore(
        (state) => state.catalogName.tenant
    );

    return useMemo(() => {
        if (selectedTenant && storageMappings?.[selectedTenant]) {
            return options.filter(({ dataPlaneName }) =>
                storageMappings[selectedTenant].data_planes.includes(
                    dataPlaneName.whole
                )
            );
        }

        return options;
    }, [options, selectedTenant, storageMappings]);
};
