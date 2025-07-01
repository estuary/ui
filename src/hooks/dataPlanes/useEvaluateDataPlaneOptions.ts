import { useCallback } from 'react';

import { getDataPlaneOptions } from 'src/api/dataPlanes';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
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
    const isEdit = useEntityWorkflow_Editing();

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const setDataPlaneOptions = useDetailsFormStore(
        (state) => state.setDataPlaneOptions
    );

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
            const { dataPlaneNames, storageMappingPrefix } = getDataPlaneInfo(
                storageMappings,
                catalogName
            );

            const { data: dataPlanes, error } =
                await getDataPlaneOptions(dataPlaneNames);

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
                          isEdit ? undefined : (existingDataPlane.name ?? '')
                      )
                    : null;

                const fallbackOptions = stubOption ? [stubOption] : [];

                setDataPlaneOptions(fallbackOptions);

                return fallbackOptions;
            }

            const options = dataPlanes
                ? dataPlanes.map((dataPlane) =>
                      generateDataPlaneOption(
                          dataPlane,
                          isEdit ? undefined : dataPlaneNames[0]
                      )
                  )
                : [];

            setDataPlaneOptions(options);
            setStorageMappingPrefix(storageMappingPrefix ?? '');

            return options;
        },
        [storageMappings, setDataPlaneOptions, setStorageMappingPrefix, isEdit]
    );
};
