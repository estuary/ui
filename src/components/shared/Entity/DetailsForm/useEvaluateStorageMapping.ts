import type { DataPlaneOption } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { getDataPlaneInfo } from 'src/utils/dataPlane-utils';

export const useEvaluateStorageMapping = () => {
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const setStorageMappingPrefix = useWorkflowStore(
        (state) => state.setStorageMappingPrefix
    );
    const currentStorageMappingPrefix = useWorkflowStore(
        (state) => state.storageMappingPrefix
    );

    const getDataPlaneOption = useCallback(
        (dataPlaneId: string | undefined, catalogName: string | undefined) => {
            let selectedOption = options.find(
                (option) => option.id === (dataPlaneId ?? '')
            );

            if (typeof selectedOption !== 'undefined') {
                return selectedOption;
            }

            if (catalogName) {
                const { dataPlaneNames } = getDataPlaneInfo(
                    storageMappings,
                    catalogName
                );

                return dataPlaneNames.length > 0
                    ? options.find(
                          (option) =>
                              option.dataPlaneName.whole === dataPlaneNames[0]
                      )
                    : undefined;
            }

            return undefined;
        },
        [options, storageMappings]
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

            let targetDataPlaneId: string | undefined = selectedDataPlane?.id;

            if (
                catalogName.length > 0 &&
                storageMappingPrefix !== currentStorageMappingPrefix
            ) {
                setStorageMappingPrefix(storageMappingPrefix ?? '');

                // Do not change the selected data-plane if the matched storage mapping
                // has access to it.
                targetDataPlaneId =
                    selectedDataPlane &&
                    dataPlaneNames.includes(
                        selectedDataPlane.dataPlaneName.whole
                    )
                        ? selectedDataPlane.id
                        : undefined;
            }

            return getDataPlaneOption(targetDataPlaneId, catalogName);
        },
        [
            currentStorageMappingPrefix,
            getDataPlaneOption,
            setStorageMappingPrefix,
            storageMappings,
        ]
    );

    return { evaluateStorageMapping };
};
