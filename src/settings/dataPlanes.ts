import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';

export const DATA_PLANE_PREFIX = 'ops/dp/';

export const DATA_PLANE_SETTINGS = {
    public: {
        prefix: `${DATA_PLANE_PREFIX}public/`,
    },
    private: {
        prefix: `${DATA_PLANE_PREFIX}private/`,
    },
} satisfies Record<DataPlaneScopes, { prefix: string }>;
