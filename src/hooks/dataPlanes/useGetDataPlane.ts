import type { DataPlaneOption, Details } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';

function useGetDataPlane() {
    // TODO (data planes) - don't want the options being passed in. Need to store those off
    // const [dataPlaneOptions] = useEntitiesStore((state) => [state.dataPlanes]);

    return useCallback(
        (
            dataPlaneOptions: DataPlaneOption[],
            dataPlaneId: string | null
        ): Details['data']['dataPlane'] | null => {
            const selectedOption = dataPlaneId
                ? dataPlaneOptions.find(({ id }) => id === dataPlaneId)
                : undefined;

            if (selectedOption) {
                return selectedOption;
            }

            // TODO (private data plane) - we need to add support for allowing tenants to configure their
            //  preferred data plane.

            // If we are not trying to find a specific data plane and there is only one option
            //  and it is private we are pretty safe in prefilling that one.
            if (
                !dataPlaneId &&
                dataPlaneOptions.length === 1 &&
                dataPlaneOptions[0].dataPlaneName.whole.includes(
                    DATA_PLANE_SETTINGS.private.prefix
                )
            ) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    defaultedPrivate: true,
                });
                return dataPlaneOptions[0];
            }

            // Try to find the default public data plane
            const defaultOption = dataPlaneOptions.find(
                ({ dataPlaneName }) =>
                    dataPlaneName.whole ===
                    `${DATA_PLANE_SETTINGS.public.prefix}${defaultDataPlaneSuffix}`
            );

            if (dataPlaneId) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    targetDataPlaneId: dataPlaneId,
                    defaultDataPlaneId: defaultOption?.id ?? 'none',
                });
            }

            return defaultOption ?? null;
        },
        []
    );
}

export default useGetDataPlane;
