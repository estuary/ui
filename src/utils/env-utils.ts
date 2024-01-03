declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
        } | null;
        monaco: any;
        LogRocket?: {
            identify: Function;
            log: Function;
            track: Function;
        };
        Osano?: {
            cm?: {
                mode?: 'permissive' | 'debug' | 'production';
                showDrawer?: (arg: string) => void;
            };
        };
    }
}

const ENABLED = 'true';

export const isProduction = import.meta.env.PROD;

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
    const enableEmailRegister =
        import.meta.env.VITE_ALLOW_EMAIL_REGISTER === ENABLED;

    return {
        enableEmailRegister,
        showEmail,
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
            'Missing Privacy or TOS environmental settings: [VITE_URLS_PRIVACY_POLICY, VITE_URLS_TERMS_OF_SERVICE]'
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
    if (import.meta.env.VITE_LOGROCKET_ENABLED === ENABLED) {
        return {
            appID: import.meta.env.VITE_LOGROCKET_APP_ID ?? null,
            serverURL: import.meta.env.VITE_LOGROCKET_SERVER_URL ?? null,
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

export const getGatewayAuthTokenSettings = () => {
    const gatewayAuthTokenEndpoint = import.meta.env
        .VITE_GATEWAY_AUTH_TOKEN_URL;

    if (gatewayAuthTokenEndpoint) {
        return { gatewayAuthTokenEndpoint };
    } else {
        throw new Error(
            'Missing endpoint for creating gateway auth tokens: VITE_GATEWAY_AUTH_TOKEN_URL'
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

    return settings;
};

export const getOsanoSettings = () => {
    const settings = {
        bodyClass: import.meta.env.VITE_OSANO_HIDE_WIDGET_CLASS ?? '',
    };

    return settings;
};

export const getDocsSettings = () => {
    const settings = {
        origin: import.meta.env.VITE_DOCS_ORIGIN ?? '',
        iframeStringInclude:
            import.meta.env.VITE_DOCS_IFRAME_STRING_INCLUDE ?? '',
    };

    return settings;
};
