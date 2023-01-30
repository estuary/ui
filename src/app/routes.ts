export const REDIRECT_TO_PARAM_NAME = 'redirect_to';

export const unauthenticatedRoutes = {
    path: '',
    auth: {
        path: '/auth',
    },
    register: {
        path: '/register',
    },
    magicLink: {
        path: '/magicLink',
    },
};

export const authenticatedRoutes = {
    oauth: {
        path: '/oauth',
    },
    admin: {
        title: 'routeTitle.admin',
        path: '/admin',
        accessGrants: {
            title: 'routeTitle.admin.accessGrants',
            path: 'accessGrants',
            fullPath: '/admin/accessGrants',
        },
        api: {
            title: 'routeTitle.admin.api',
            path: 'api',
            fullPath: '/admin/api',
        },
        connectors: {
            title: 'routeTitle.admin.connectors',
            path: 'connectors',
            fullPath: '/admin/connectors',
        },
        cookies: {
            title: 'routeTitle.admin.cookies',
            path: 'cookies',
            fullPath: '/admin/cookies',
        },
        storageMappings: {
            title: 'routeTitle.admin.storageMappings',
            path: 'storage-mappings',
            fullPath: '/admin/storage-mappings',
        },
    },
    captures: {
        title: 'routeTitle.captures',
        path: '/captures',
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/captures/create',
        },
        details: {
            title: 'routeTitle.captureDetails',
            path: 'details',
            fullPath: '/captures/details',
        },
        edit: {
            title: 'routeTitle.captureEdit',
            path: `edit`,
            fullPath: '/captures/edit',
        },
    },
    collections: {
        title: 'routeTitle.collections',
        path: '/collections',
        details: {
            title: 'routeTitle.collectionDetails',
            path: 'details',
            fullPath: '/collections/details',
        },
    },
    details: {
        title: 'routeTitle.details',
        path: '/details',
    },
    home: {
        title: 'routeTitle.home',
        path: '/',
    },
    materializations: {
        title: 'routeTitle.materializations',
        path: '/materializations',
        create: {
            title: 'routeTitle.materializationCreate',
            path: 'create',
            fullPath: '/materializations/create',
        },
        details: {
            title: 'routeTitle.materializationDetails',
            path: 'details',
            fullPath: '/materializations/details',
        },
        edit: {
            title: 'routeTitle.materializationEdit',
            path: 'edit',
            fullPath: '/materializations/edit',
        },
    },
    user: {
        title: 'routeTitle.user',
        path: '/user',
        registration: {
            title: 'routeTitle.registration',
            path: 'register',
            fullPath: '/user/register',
        },
    },
    pageNotFound: {
        title: 'routeTitle.error.pageNotFound',
        path: '*',
    },
};
