export const REDIRECT_TO_PARAM_NAME = 'redirect_to';

// TODO (routing)
//  Broke up the large objects and then exported them as one. This was to reduce the scope of
//      changes. Eventually I think we should just import in `admin` or `capture` and not `authenticated`.
//
//  We need to move our routes from the component approach to the JSON approach. I am hoping
//      that it will allow us to not have to "duplicate" the routing efforts and we can just
//      reference the route JSON object when needed.

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
    billing: {
        title: 'routeTitle.admin.billing',
        path: 'billing',
        fullPath: '/admin/billing',
        addPayment: {
            title: 'routeTitle.admin.billing',
            path: `paymentMethod/new`,
            fullPath: '/admin/billing/paymentMethod/new',
        },
    },
    notifications: {
        title: 'routeTitle.admin.notifications',
        path: 'notifications',
        fullPath: '/admin/notifications',
    },
    settings: {
        title: 'routeTitle.admin.settings',
        path: 'settings',
        fullPath: '/admin/settings',
    },
};

// The title message IDs for the overview, spec, and history capture details tabs do not appear to be in use.
const captures = {
    title: 'routeTitle.captures',
    path: 'captures',
    fullPath: '/captures',
    create: {
        title: 'routeTitle.captureCreate',
        path: `create`,
        fullPath: '/captures/create',
        new: {
            title: 'routeTitle.captureCreate',
            path: `create/new`,
            fullPath: '/captures/create/new',
        },
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
        ops: {
            title: 'routeTitle.captureDetails.ops',
            path: 'ops',
            fullPath: '/captures/details/ops',
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
    fullPath: '/collections',
    create: {
        title: 'routeTitle.collectionCreate',
        path: 'create',
        fullPath: '/collections/create',
        new: {
            title: 'routeTitle.collectionCreate',
            path: 'create/new',
            fullPath: '/collections/create/new',
        },
    },
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
        ops: {
            title: 'routeTitle.collectionDetails.ops',
            path: 'ops',
            fullPath: '/collections/details/ops',
        },
    },
};

const dataPlaneAuth = {
    title: 'routeTitle.dataPlaneAuthReq',
    path: '/data-plane-auth-req',
};

const express = {
    captureCreate: {
        title: 'routeTitle.captureCreate',
        path: `express/captureCreate`,
        fullPath: '/express/captureCreate',
        new: {
            title: 'routeTitle.captureCreate',
            path: `new`,
            fullPath: '/express/captureCreate/new',
        },
    },
};

const home = {
    title: 'routeTitle.home',
    path: '/welcome',
};

const marketplace = {
    authenticated: {
        verify: {
            title: 'routeTitle.marketplaceVerify',
            path: 'verify',
            fullPath: '/marketplace/verify',
        },
    },
    unauthenticated: {
        callback: {
            path: 'callback',
            fullPath: '/marketplace/callback',
        },
    },
};

const materializations = {
    title: 'routeTitle.materializations',
    path: 'materializations',
    fullPath: '/materializations',
    create: {
        title: 'routeTitle.materializationCreate',
        path: 'create',
        fullPath: '/materializations/create',
        new: {
            title: 'routeTitle.materializationCreate',
            path: 'create/new',
            fullPath: '/materializations/create/new',
        },
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
        ops: {
            title: 'routeTitle.materializationDetails.ops',
            path: 'ops',
            fullPath: '/materializations/details/ops',
        },
    },
    edit: {
        title: 'routeTitle.materializationEdit',
        path: 'edit',
        fullPath: '/materializations/edit',
    },
};

const oauth = {
    path: '/oauth',
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

const beta = {
    title: 'routeTitle.collectionCreate',
    path: 'beta/collections/create',
    fullPath: '/beta/collections/create',
    new: {
        title: 'routeTitle.collectionCreate',
        path: 'new',
        fullPath: '/beta/collections/create/new',
    },
};

export const authenticatedRoutes = {
    path: '/',
    oauth,
    admin,
    captures,
    collections,
    dataPlaneAuth,
    express,
    home,
    materializations,
    marketplace: marketplace.authenticated,
    user,
    pageNotFound,
    beta,
};

export const unauthenticatedRoutes = {
    path: '',
    auth: {
        path: '/auth',
    },
    logout: {
        path: '/logout',
    },
    login: {
        path: '/login',
    },
    register: {
        path: '/register',
        callback: {
            path: 'callback',
            fullPath: '/register/callback',
        },
    },
    sso: {
        path: '/sso',
        login: {
            path: 'login',
            fullPath: '/sso/login',
        },
        register: {
            path: 'register',
            fullPath: '/sso/register',
        },
    },
    magicLink: {
        path: '/magicLink',
    },
    marketplace: marketplace.unauthenticated,
};
