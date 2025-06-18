import { useMemo } from 'react';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { getDataPlaneNames } from 'src/utils/dataPlane-utils';

export const useDataPlaneOptions = () => {
    const catalogName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    return useMemo(() => {
        if (catalogName) {
            const dataPlaneNames = getDataPlaneNames(
                storageMappings,
                catalogName
            );

            return options.filter(({ dataPlaneName }) =>
                dataPlaneNames.includes(dataPlaneName.whole)
            );
        }

        return options;
    }, [catalogName, options, storageMappings]);
};
