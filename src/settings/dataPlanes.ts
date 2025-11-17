import type { DataPlaneSetting } from 'src/settings/types';
import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';

export const DATA_PLANE_PREFIX = 'ops/dp/';

export const DATA_PLANE_SETTINGS: {
    [key in DataPlaneScopes]: DataPlaneSetting;
} = {
    public: {
        prefix: `${DATA_PLANE_PREFIX}public/`,
        table: {
            filterIntlKey: 'admin.dataPlanes.table.filterLabel',
            headerIntlKey: 'admin.dataPlanes.header',
            noExistingDataContentIds: {
                header: `admin.dataPlanes.public.table.noContent.header`,
                message: `admin.dataPlanes.public.table.noContent.message`,
                disableDoclink: false,
            },
        },
    },
    private: {
        prefix: `${DATA_PLANE_PREFIX}private/`,
        table: {
            filterIntlKey: 'admin.dataPlanes.table.filterLabel',
            headerIntlKey: 'admin.dataPlanes.header',
            noExistingDataContentIds: {
                header: `admin.dataPlanes.private.table.noContent.header`,
                message: `admin.dataPlanes.private.table.noContent.message`,
                disableDoclink: true,
            },
        },
    },
};
