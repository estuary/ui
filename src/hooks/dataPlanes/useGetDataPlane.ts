import type { DataPlaneOption, Details } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';

function useGetDataPlane() {
    // TODO (data planes) - don't want the options being passed in. Need to store those off
    // const [dataPlaneOptions] = useEntitiesStore(useShallow((state) => [state.dataPlanes]));

    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

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

            // Use the default data-plane specified by the storage mapping.
            const defaultDataPlaneOption = dataPlaneOptions.find((option) =>
                hasSupportRole
                    ? option.dataPlaneName.whole ===
                      `${DATA_PLANE_SETTINGS.public.prefix}${defaultDataPlaneSuffix}`
                    : option.isDefault
            );

            if (
                !dataPlaneId &&
                dataPlaneOptions.length > 0 &&
                defaultDataPlaneOption
            ) {
                return defaultDataPlaneOption;
            }

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
        [hasSupportRole]
    );
}

export default useGetDataPlane;
