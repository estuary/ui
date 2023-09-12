declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
        } | null;
        monaco: any;
        Osano?: {
            cm?: {
                mode?: 'permissive' | 'debug' | 'production';
                showDrawer?: (arg: string) => void;
            };
        };
    }
}

const ENABLED = 'true';

export const isProduction = process.env.NODE_ENV === 'production';

export const getAppVersion = () => {
    return process.env.REACT_APP_VERSION;
};

export const getAuthPath = () => {
    return window.Estuary?.auth_url
        ? window.Estuary.auth_url
        : process.env.REACT_APP_AUTH_BASE_URL;
};

export const getAPIPath = () => {
    return window.Estuary?.api_endpoint
        ? window.Estuary.api_endpoint
        : process.env.REACT_APP_API_BASE_URL;
};

export const getLoginSettings = () => {
    const showEmail = process.env.REACT_APP_SHOW_EMAIL_LOGIN === ENABLED;
    const enableEmailRegister =
        process.env.REACT_APP_ALLOW_EMAIL_REGISTER === ENABLED;

    return {
        enableEmailRegister,
        showEmail,
    };
};

// TODO (refactor) We should switch this to a provider
export const getUrls = () => {
    const privacyPolicy = process.env.REACT_APP_URLS_PRIVACY_POLICY;
    const termsOfService = process.env.REACT_APP_URLS_TERMS_OF_SERVICE;

    if (privacyPolicy && termsOfService) {
        return {
            privacyPolicy,
            termsOfService,
        };
    } else {
        throw new Error(
            'Missing Privacy or TOS environmental settings: [REACT_APP_URLS_PRIVACY_POLICY, REACT_APP_URLS_TERMS_OF_SERVICE]'
        );
    }
};

type Settings = {
    appID: string | null;
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
export const getLogRocketSettings = (): Settings | null => {
    if (process.env.REACT_APP_LOGROCKET_ENABLED === ENABLED) {
        return {
            appID: process.env.REACT_APP_LOGROCKET_APP_ID ?? null,
            serverURL: process.env.REACT_APP_LOGROCKET_SERVER_URL ?? null,
            idUser: {
                enabled: process.env.REACT_APP_LOGROCKET_ID_USER === ENABLED,
                includeName:
                    process.env.REACT_APP_LOGROCKET_ID_USER_INCLUDE_NAME ===
                    ENABLED,
                includeEmail:
                    process.env.REACT_APP_LOGROCKET_ID_USER_INCLUDE_EMAIL ===
                    ENABLED,
            },
            sanitize: {
                inputs:
                    process.env.REACT_APP_LOGROCKET_SANITIZE_INPUTS === ENABLED,
                request:
                    process.env.REACT_APP_LOGROCKET_SANITIZE_REQUESTS ===
                    ENABLED,
                response:
                    process.env.REACT_APP_LOGROCKET_SANITIZE_RESPONSES ===
                    ENABLED,
                text: process.env.REACT_APP_LOGROCKET_SANITIZE_TEXT === ENABLED,
            },
        };
    }

    return null;
};

export const getEncryptionSettings = () => {
    const encryptionEndpoint = process.env.REACT_APP_ENCRYPTION_URL;

    if (encryptionEndpoint) {
        return {
            encryptionEndpoint,
        };
    } else {
        throw new Error(
            'Missing endpoint for encrypting endpoint configs: REACT_APP_ENCRYPTION_URL'
        );
    }
};

export const getGatewayAuthTokenSettings = () => {
    const gatewayAuthTokenEndpoint =
        process.env.REACT_APP_GATEWAY_AUTH_TOKEN_URL;

    if (gatewayAuthTokenEndpoint) {
        return { gatewayAuthTokenEndpoint };
    } else {
        throw new Error(
            'Missing endpoint for creating gateway auth tokens: REACT_APP_GATEWAY_AUTH_TOKEN_URL'
        );
    }
};

export const getSupabaseAnonymousKey = () => {
    const supabaseAnonymousKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (supabaseAnonymousKey) {
        return { supabaseAnonymousKey };
    } else {
        throw new Error(
            'Missing Supabase anonymous key: REACT_APP_SUPABASE_ANON_KEY'
        );
    }
};

export const getGoogleTageManagerSettings = () => {
    const settings = {
        enabled: process.env.REACT_APP_GOOGLE_TAG_MANAGER_ENABLED === ENABLED,
        id: process.env.REACT_APP_GOOGLE_TAG_MANAGER_ID,
    };

    return settings;
};

export const getOsanoSettings = () => {
    const settings = {
        bodyClass: process.env.REACT_APP_OSANO_HIDE_WIDGET_CLASS ?? '',
    };

    return settings;
};

export const getDocsSettings = () => {
    const settings = {
        origin: process.env.REACT_APP_DOCS_ORIGIN ?? '',
        iframeStringInclude:
            process.env.REACT_APP_DOCS_IFRAME_STRING_INCLUDE ?? '',
    };

    return settings;
};
