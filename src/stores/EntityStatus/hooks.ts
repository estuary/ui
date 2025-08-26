import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import {
    isCaptureControllerStatus,
    isEntityControllerStatus,
} from 'src/utils/entityStatus-utils';

export const useEntityStatusStore_singleResponse = (catalogName: string) => {
    return useEntityStatusStore(
        useShallow((state) =>
            state.responses
                ?.filter((datum) => datum.catalog_name === catalogName)
                .at(0)
        )
    );
};

export const useEntityStatusStore_autoDiscoverFailure = (
    catalogName: string
) => {
    const response = useEntityStatusStore_singleResponse(catalogName);

    if (
        !response ||
        !response?.controller_status ||
        !isCaptureControllerStatus(response.controller_status)
    ) {
        return undefined;
    }

    return response.controller_status.auto_discover?.failure;
};

export const useEntityStatusStore_autoDiscoverLastSuccess = (
    catalogName: string
) => {
    const response = useEntityStatusStore_singleResponse(catalogName);

    if (
        !response ||
        !response?.controller_status ||
        !isCaptureControllerStatus(response.controller_status)
    ) {
        return undefined;
    }

    return response.controller_status.auto_discover?.last_success;
};

export const useEntityStatusStore_lastActivated = (catalogName: string) => {
    const response = useEntityStatusStore_singleResponse(catalogName);

    if (
        !response?.controller_status ||
        !isEntityControllerStatus(response.controller_status)
    ) {
        return undefined;
    }

    return response.controller_status.activation?.last_activated;
};

export const useEntityStatusStore_recentHistory = (catalogName: string) => {
    const response = useEntityStatusStore_singleResponse(catalogName);

    return useMemo(
        () =>
            response?.controller_status &&
            isEntityControllerStatus(response.controller_status)
                ? response.controller_status.publications?.history
                : [],
        [response]
    );
};
