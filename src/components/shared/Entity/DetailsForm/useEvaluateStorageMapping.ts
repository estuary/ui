import type { DataPlaneOption } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { getDataPlaneInfo } from 'src/utils/dataPlane-utils';

export const useEvaluateStorageMapping = () => {
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const existingDataPlaneOption = useDetailsFormStore(
        (state) => state.existingDataPlaneOption
    );

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    const setStorageMappingPrefix = useWorkflowStore(
        (state) => state.setStorageMappingPrefix
    );
    const currentStorageMappingPrefix = useWorkflowStore(
        (state) => state.storageMappingPrefix
    );
    const previousNameEmpty = useWorkflowStore(
        (state) => state.catalogName.whole.length === 0
    );

    const getDataPlaneOption = useCallback(
        (
            dataPlaneId: string | undefined,
            catalogName: string | undefined,
            dataPlaneNames: string[],
            supportUser: boolean,
            existingOption: DataPlaneOption | undefined
        ) => {
            let selectedOption = options.find(
                (option) => option.id === (dataPlaneId ?? '')
            );

            if (typeof selectedOption !== 'undefined') {
                return selectedOption;
            }

            if (!supportUser && catalogName) {
                return dataPlaneNames.length > 0
                    ? options.find(
                          (option) =>
                              option.dataPlaneName.whole === dataPlaneNames[0]
                      )
                    : existingOption;
            }

            return existingOption;
        },
        [options]
    );

    const evaluateStorageMapping = useCallback(
        (
            catalogName: string,
            selectedDataPlane: DataPlaneOption | undefined
        ): DataPlaneOption | undefined => {
            // Get the storage mapping with the closest catalog prefix match.
            const { dataPlaneNames, storageMappingPrefix } = getDataPlaneInfo(
                storageMappings,
                catalogName
            );

            // Add the existing data-plane name to the array of data-plane names of the
            // matched storage mapping in the event it is not there. This data-plane should
            // be treated as the default in edit workflows so it must be the first element
            // in the array of data-plane names.
            const evaluatedDataPlaneNames =
                existingDataPlaneOption &&
                !dataPlaneNames.includes(
                    existingDataPlaneOption.dataPlaneName.whole
                )
                    ? [existingDataPlaneOption.dataPlaneName.whole].concat(
                          dataPlaneNames
                      )
                    : dataPlaneNames;

            let targetDataPlaneId: string | undefined = selectedDataPlane?.id;

            if (
                !hasSupportRole &&
                catalogName.length > 0 &&
                storageMappingPrefix !== currentStorageMappingPrefix
            ) {
                setStorageMappingPrefix(storageMappingPrefix ?? '');

                // Do not change the selected data-plane if the matched storage mapping
                // has access to it. The only exception to this rule is when the data-plane
                // selector is defaulted during hydration in create workflows.
                targetDataPlaneId =
                    selectedDataPlane &&
                    evaluatedDataPlaneNames.includes(
                        selectedDataPlane.dataPlaneName.whole
                    ) &&
                    !previousNameEmpty
                        ? selectedDataPlane.id
                        : undefined;
            }

            return getDataPlaneOption(
                targetDataPlaneId,
                catalogName,
                evaluatedDataPlaneNames,
                hasSupportRole,
                existingDataPlaneOption
            );
        },
        [
            currentStorageMappingPrefix,
            existingDataPlaneOption,
            getDataPlaneOption,
            hasSupportRole,
            previousNameEmpty,
            setStorageMappingPrefix,
            storageMappings,
        ]
    );

    return { evaluateStorageMapping };
};
