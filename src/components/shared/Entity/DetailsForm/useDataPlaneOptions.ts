import { useMemo } from 'react';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { getDataPlaneInfo } from 'src/utils/dataPlane-utils';

export const useDataPlaneOptions = () => {
    const catalogName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const existingDataPlaneOption = useDetailsFormStore(
        (state) => state.existingDataPlaneOption
    );
    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    return useMemo(() => {
        if (!hasSupportRole && catalogName) {
            const { dataPlaneNames, storageMappingPrefix } = getDataPlaneInfo(
                storageMappings,
                catalogName
            );

            // Add the existing data-plane name to the array of data-plane names of the
            // matched storage mapping in the event it is not there. This data-plane should
            // be treated as the default in edit workflows so it must be the first element
            // in the array of data-plane names.
            const evaluatedDataPlaneNames =
                storageMappingPrefix &&
                existingDataPlaneOption?.[storageMappingPrefix] &&
                !dataPlaneNames.includes(
                    existingDataPlaneOption[storageMappingPrefix].dataPlaneName
                        .whole
                )
                    ? [
                          existingDataPlaneOption[storageMappingPrefix]
                              .dataPlaneName.whole,
                      ].concat(dataPlaneNames)
                    : dataPlaneNames;

            return options.filter(({ dataPlaneName }) =>
                evaluatedDataPlaneNames.includes(dataPlaneName.whole)
            );
        }

        return options;
    }, [
        catalogName,
        existingDataPlaneOption,
        hasSupportRole,
        options,
        storageMappings,
    ]);
};
