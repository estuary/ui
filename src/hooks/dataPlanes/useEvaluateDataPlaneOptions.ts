import { useCallback } from 'react';

import { getDataPlaneOptions } from 'src/api/dataPlanes';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import {
    generateDataPlaneOption,
    getDataPlaneInfo,
} from 'src/utils/dataPlane-utils';

export const useEvaluateDataPlaneOptions = () => {
    const setDataPlaneOptions = useDetailsFormStore(
        (state) => state.setDataPlaneOptions
    );

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const setStorageMappingPrefix = useWorkflowStore(
        (state) => state.setStorageMappingPrefix
    );

    return useCallback(
        async (
            catalogName?: string,
            existingDataPlane?: {
                name: string | null;
                id: string;
                reactorAddress: string | null;
            }
        ) => {
            // Get required data-plane information from the matched storage mapping.
            const { dataPlaneNames, storageMappingPrefix } = getDataPlaneInfo(
                storageMappings,
                catalogName
            );

            // Add the existing data-plane name to the array of data-plane names of the
            // matched storage mapping in the event it is not there. This data-plane should
            // be treated as the default in edit workflows so it must be the first element
            // in the array of data-plane names.
            const evaluatedDataPlaneNames = existingDataPlane?.name
                ? [existingDataPlane.name].concat(dataPlaneNames)
                : dataPlaneNames;

            const { data: dataPlanes, error } = await getDataPlaneOptions(
                evaluatedDataPlaneNames
            );

            if (!dataPlanes || dataPlanes.length === 0 || error) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    noOptionsFound: true,
                    fallbackExists: Boolean(existingDataPlane),
                });

                const stubOption = existingDataPlane
                    ? generateDataPlaneOption(
                          {
                              data_plane_name: existingDataPlane.name ?? '',
                              id: existingDataPlane.id,
                              reactor_address:
                                  existingDataPlane.reactorAddress ?? '',
                              cidr_blocks: null,
                              gcp_service_account_email: null,
                              aws_iam_user_arn: null,
                          },
                          existingDataPlane.name ?? ''
                      )
                    : null;

                const fallbackOptions = stubOption ? [stubOption] : [];

                setDataPlaneOptions(fallbackOptions);

                return fallbackOptions;
            }

            // If the array of data-planes does not contain an element with the same name
            // as the existing data-plane, stub the BaseDataPlaneQuery response corresponding
            // to the existing data-plane so it can appear as a data-plane option. This is
            // particularly important for edit workflows.
            const evaluatedDataPlanes = dataPlanes;
            const existingDataPlaneFetched = Boolean(
                existingDataPlane?.name &&
                    dataPlanes.some(
                        ({ data_plane_name }) =>
                            data_plane_name === existingDataPlane.name
                    )
            );

            if (existingDataPlane && !existingDataPlaneFetched) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    noOptionsFound: false,
                    fallbackExists: Boolean(existingDataPlane),
                });

                evaluatedDataPlanes.concat({
                    data_plane_name: existingDataPlane.name ?? '',
                    id: existingDataPlane.id,
                    reactor_address: existingDataPlane.reactorAddress ?? '',
                    cidr_blocks: null,
                    gcp_service_account_email: null,
                    aws_iam_user_arn: null,
                });
            }

            const options = dataPlanes
                ? dataPlanes.map((dataPlane) =>
                      generateDataPlaneOption(
                          dataPlane,
                          evaluatedDataPlaneNames[0]
                      )
                  )
                : [];

            setDataPlaneOptions(options);
            setStorageMappingPrefix(storageMappingPrefix ?? '');

            return options;
        },
        [storageMappings, setDataPlaneOptions, setStorageMappingPrefix]
    );
};
