import { DataPlaneScopes } from 'stores/DetailsForm/types';
import { DataPlaneSetting } from './types';

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
