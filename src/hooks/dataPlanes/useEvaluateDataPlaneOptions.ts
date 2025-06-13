import { useCallback } from 'react';

import { getDataPlaneOptions } from 'src/api/dataPlanes';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';

export const useEvaluateDataPlaneOptions = () => {
    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const setDataPlaneOptions = useDetailsFormStore(
        (state) => state.setDataPlaneOptions
    );

    return useCallback(
        async (
            prefix?: string,
            existingDataPlane?: {
                name: string | null;
                id: string;
                reactorAddress: string | null;
            }
        ) => {
            const dataPlaneNames =
                prefix && storageMappings?.[prefix]
                    ? storageMappings[prefix].data_planes
                    : Object.values(storageMappings).length === 1
                      ? Object.values(storageMappings)[0].data_planes
                      : [];

            const { data: dataPlanes, error } =
                await getDataPlaneOptions(dataPlaneNames);

            if (!dataPlanes || dataPlanes.length === 0 || error) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    noOptionsFound: true,
                    fallbackExists: Boolean(existingDataPlane),
                });

                const stubOption = existingDataPlane
                    ? generateDataPlaneOption({
                          data_plane_name: existingDataPlane.name ?? '',
                          id: existingDataPlane.id,
                          reactor_address:
                              existingDataPlane.reactorAddress ?? '',
                          cidr_blocks: null,
                          gcp_service_account_email: null,
                          aws_iam_user_arn: null,
                      })
                    : null;

                const fallbackOptions = stubOption ? [stubOption] : [];

                setDataPlaneOptions(fallbackOptions);

                return fallbackOptions;
            }

            const options = dataPlanes
                ? dataPlanes.map(generateDataPlaneOption)
                : [];

            setDataPlaneOptions(options);

            return options;
        },
        [storageMappings, setDataPlaneOptions]
    );
};
