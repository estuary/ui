import type { DataPlaneSetting } from 'src/settings/types';
import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';

export const DATA_PLANE_PREFIX = 'ops/dp/';

export const DATA_PLANE_SETTINGS: {
    [key in DataPlaneScopes]: DataPlaneSetting;
} = {
    public: {
        prefix: `${DATA_PLANE_PREFIX}public/`,
    },
    private: {
        prefix: `${DATA_PLANE_PREFIX}private/`,
    },
};
