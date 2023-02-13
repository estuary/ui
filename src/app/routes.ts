export const REDIRECT_TO_PARAM_NAME = 'redirect_to';

const admin = {
    title: 'routeTitle.admin',
    path: 'admin',
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
};

const captures = {
    title: 'routeTitle.captures',
    path: 'captures',
    create: {
        title: 'routeTitle.captureCreate',
        path: `create`,
        fullPath: '/captures/create',
    },
    details: {
        title: 'routeTitle.captureDetails',
        path: 'details',
        fullPath: '/captures/details',
        overview: {
            title: 'routeTitle.captureDetails.overview',
            path: 'overview',
            fullPath: '/captures/details/overview',
        },
        spec: {
            title: 'routeTitle.captureDetails.spec',
            path: 'spec',
            fullPath: '/captures/details/spec',
        },
        history: {
            title: 'routeTitle.captureDetails.history',
            path: 'history',
            fullPath: '/captures/details/history',
        },
    },
    edit: {
        title: 'routeTitle.captureEdit',
        path: `edit`,
        fullPath: '/captures/edit',
    },
};

const collections = {
    title: 'routeTitle.collections',
    path: 'collections',
    details: {
        title: 'routeTitle.collectionDetails',
        path: 'details',
        fullPath: '/collections/details',
        overview: {
            title: 'routeTitle.collectionDetails.overview',
            path: 'overview',
            fullPath: '/collections/details/overview',
        },
        spec: {
            title: 'routeTitle.collectionDetails.spec',
            path: 'spec',
            fullPath: '/collections/details/spec',
        },
        history: {
            title: 'routeTitle.collectionDetails.history',
            path: 'history',
            fullPath: '/collections/details/history',
        },
    },
};

const home = {
    title: 'routeTitle.home',
    path: '',
};

const materializations = {
    title: 'routeTitle.materializations',
    path: 'materializations',
    create: {
        title: 'routeTitle.materializationCreate',
        path: 'create',
        fullPath: '/materializations/create',
    },
    details: {
        title: 'routeTitle.materializationDetails',
        path: 'details',
        fullPath: '/materializations/details',
        overview: {
            title: 'routeTitle.materializationDetails.overview',
            path: 'overview',
            fullPath: '/materializations/details/overview',
        },
        spec: {
            title: 'routeTitle.materializationDetails.spec',
            path: 'spec',
            fullPath: '/materializations/details/spec',
        },
        history: {
            title: 'routeTitle.materializationDetails.history',
            path: 'history',
            fullPath: '/materializations/details/history',
        },
    },
    edit: {
        title: 'routeTitle.materializationEdit',
        path: 'edit',
        fullPath: '/materializations/edit',
    },
};

const oauth = {
    path: 'oauth',
};

const pageNotFound = {
    title: 'routeTitle.error.pageNotFound',
    path: '*',
};

const user = {
    title: 'routeTitle.user',
    path: 'user',
    registration: {
        title: 'routeTitle.registration',
        path: 'register',
        fullPath: '/user/register',
    },
};

export const authenticatedRoutes = {
    oauth,
    admin,
    captures,
    collections,
    home,
    materializations,
    user,
    pageNotFound,
};

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
