import { useCallback } from 'react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';

function useEvaluateDataPlaneOptions() {
    const [dataPlanes] = useEntitiesStore((state) => [state.dataPlanes]);

    const [setDataPlaneOptions] = useDetailsFormStore((state) => [
        state.setDataPlaneOptions,
    ]);

    return useCallback(
        (existingDataPlane?: {
            name: string | null;
            id: string;
            reactorAddress: string | null;
        }) => {
            if (!dataPlanes || dataPlanes.length === 0) {
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
        [dataPlanes, setDataPlaneOptions]
    );
}

export default useEvaluateDataPlaneOptions;
