import { getWithExpiry } from 'src/_compliance/shared';

declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
            enableDataFlowReset: boolean;
        } | null;
        dataLayer?: any[]; // Must match name we pass to GTM in index.html
        monaco: any;
        __REDUX_DEVTOOLS_EXTENSION__: any;
        // TODO (integrity | logrocket)
        // When we load in LogRocket with a script tag we'll want this
        // LogRocket?: {
        //     identify: Function;
        //     init: Function;
        //     log: Function;
        //     track: Function;
        // };
    }
}

const ENABLED = 'true';

export const isProduction = import.meta.env.PROD;

export const defaultDataPlaneSuffix = ((): string => {
    const dataPlaneSuffix = import.meta.env.VITE_DEFAULT_DATA_PLANE_SUFFIX;

    if (dataPlaneSuffix) {
        return dataPlaneSuffix;
    } else {
        throw new Error(
            'Missing default data-plane suffix: VITE_DEFAULT_DATA_PLANE_SUFFIX'
        );
    }
})();

export const getAuthPath = () => {
    return window.Estuary?.auth_url
        ? window.Estuary.auth_url
        : import.meta.env.VITE_AUTH_BASE_URL;
};

export const getAPIPath = () => {
    return window.Estuary?.api_endpoint
        ? window.Estuary.api_endpoint
        : import.meta.env.VITE_API_BASE_URL;
};

export const getLoginSettings = () => {
    const showEmail = import.meta.env.VITE_SHOW_EMAIL_LOGIN === ENABLED;
    const showSSO = import.meta.env.VITE_SHOW_SSO === ENABLED;
    const enableEmailRegister =
        import.meta.env.VITE_ALLOW_EMAIL_REGISTER === ENABLED;

    return {
        enableEmailRegister,
        showEmail,
        showSSO,
    };
};

// TODO (refactor) We should switch this to a provider
export const getUrls = () => {
    const privacyPolicy = import.meta.env.VITE_URLS_PRIVACY_POLICY;
    const termsOfService = import.meta.env.VITE_URLS_TERMS_OF_SERVICE;

    if (privacyPolicy && termsOfService) {
        return {
            privacyPolicy,
            termsOfService,
        };
    } else {
        throw new Error(
            'Missing legal doc settings: [VITE_URLS_PRIVACY_POLICY, VITE_URLS_TERMS_OF_SERVICE]'
        );
    }
};

// IOptions from .../node_modules/logrocket/dist/types.d.ts
type Settings = {
    appID: string | null;
    trackUserIP: boolean;
    serverURL: string | null;
    idUser: {
        enabled: boolean;
        includeName: boolean;
        includeEmail: boolean;
    };
    sanitize: {
        inputs: boolean;
        request: boolean;
        response: boolean;
        text: boolean;
    };
};

const getLogRocketDefaultSettings = (): Settings | null => {
    if (import.meta.env.VITE_LOGROCKET_ENABLED === ENABLED) {
        return {
            appID: import.meta.env.VITE_LOGROCKET_APP_ID ?? null,
            serverURL: import.meta.env.VITE_LOGROCKET_SERVER_URL ?? null,
            trackUserIP: import.meta.env.VITE_LOGROCKET_TRACK_IP === ENABLED,
            idUser: {
                enabled: import.meta.env.VITE_LOGROCKET_ID_USER === ENABLED,
                includeName:
                    import.meta.env.VITE_LOGROCKET_ID_USER_INCLUDE_NAME ===
                    ENABLED,
                includeEmail:
                    import.meta.env.VITE_LOGROCKET_ID_USER_INCLUDE_EMAIL ===
                    ENABLED,
            },
            sanitize: {
                inputs:
                    import.meta.env.VITE_LOGROCKET_SANITIZE_INPUTS === ENABLED,
                request:
                    import.meta.env.VITE_LOGROCKET_SANITIZE_REQUESTS ===
                    ENABLED,
                response:
                    import.meta.env.VITE_LOGROCKET_SANITIZE_RESPONSES ===
                    ENABLED,
                text: import.meta.env.VITE_LOGROCKET_SANITIZE_TEXT === ENABLED,
            },
        };
    }

    return null;
};

export const getLogRocketSettings = (): Settings | null => {
    const defaults = getLogRocketDefaultSettings();

    const foo = getWithExpiry('estuary.privacy-settings');

    console.log('foo', foo);

    if (defaults) {
        // Maybe fetch the cookie values here?
        //  Need to figure that out

        return {
            ...defaults,
        };
    }

    return null;
};

export const getEncryptionSettings = () => {
    const encryptionEndpoint = import.meta.env.VITE_ENCRYPTION_URL;

    if (encryptionEndpoint) {
        return {
            encryptionEndpoint,
        };
    } else {
        throw new Error(
            'Missing endpoint for encrypting endpoint configs: VITE_ENCRYPTION_URL'
        );
    }
};

export const getMarketplaceSettings = () => {
    const verifyURL = import.meta.env.VITE_MARKETPLACE_VERIFY_URL;

    if (verifyURL) {
        return {
            verifyURL,
        };
    } else {
        throw new Error(
            'Missing endpoint for verifying marketplace subscriptions: VITE_MARKETPLACE_VERIFY_URL'
        );
    }
};

export const getTaskAuthorizationSettings = () => {
    const taskAuthorizationEndpoint = import.meta.env
        .VITE_TASK_AUTHORIZATION_URL;

    if (taskAuthorizationEndpoint) {
        return { taskAuthorizationEndpoint };
    } else {
        throw new Error(
            'Missing endpoint to access data plane information for tasks: VITE_TASK_AUTHORIZATION_URL'
        );
    }
};

export const getCollectionAuthorizationSettings = () => {
    const collectionAuthorizationEndpoint = import.meta.env
        .VITE_COLLECTION_AUTHORIZATION_URL;

    if (collectionAuthorizationEndpoint) {
        return { collectionAuthorizationEndpoint };
    } else {
        throw new Error(
            'Missing endpoint to access data plane information for collections: VITE_COLLECTION_AUTHORIZATION_URL'
        );
    }
};

export const getSupabaseAnonymousKey = () => {
    const supabaseAnonymousKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseAnonymousKey) {
        return { supabaseAnonymousKey };
    } else {
        throw new Error(
            'Missing Supabase anonymous key: VITE_SUPABASE_ANON_KEY'
        );
    }
};

export const getGoogleTageManagerSettings = () => {
    const settings = {
        enabled: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ENABLED === ENABLED,
        id: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID,
    };

    return {
        allowedToRun: Boolean(isProduction && settings.enabled && settings.id),
    };
};

export const getDocsSettings = () => {
    const settings = {
        origin: import.meta.env.VITE_DOCS_ORIGIN ?? '',
        iframeStringInclude:
            import.meta.env.VITE_DOCS_IFRAME_STRING_INCLUDE ?? '',
    };

    return settings;
};

export const getEntityStatusSettings = () => {
    const entityStatusBaseEndpoint = import.meta.env
        .VITE_ENTITY_STATUS_BASE_URL;

    if (entityStatusBaseEndpoint) {
        return { entityStatusBaseEndpoint };
    } else {
        throw new Error(
            'Missing endpoint to access entity status: VITE_ENTITY_STATUS_BASE_URL'
        );
    }
};
