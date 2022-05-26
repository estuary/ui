import { GatewayAuthTokenResponse } from 'types';

declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
        } | null;
        monaco: any;
    }
}

const ENABLED = 'true';

export enum LocalStorageKeys {
    GATEWAY = 'gateway-auth-config',
}

export const isProduction = () => {
    return process.env.NODE_ENV === 'production';
};

export const isTest = () => {
    return process.env.NODE_ENV === 'test';
};

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
    const showOIDC = process.env.REACT_APP_SHOW_OIDC_LOGIN === ENABLED;
    const showGoogle = process.env.REACT_APP_SHOW_OIDC_LOGIN_GOOGLE === ENABLED;

    return {
        showEmail,
        showOIDC,
        showGoogle,
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

export const getSWRSettings = () => {
    const logCache = process.env.REACT_APP_SWR_LOG_CACHE === ENABLED;
    const logRequests = process.env.REACT_APP_SWR_LOG_REQUESTS === ENABLED;

    return {
        logCache,
        logRequests,
    };
};

export const getLogRocketSettings = () => {
    return {
        appID: process.env.REACT_APP_LOGROCKET_APP_ID ?? null,
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
            inputs: process.env.REACT_APP_LOGROCKET_SANITIZE_INPUTS === ENABLED,
            text: process.env.REACT_APP_LOGROCKET_SANITIZE_TEXT === ENABLED,
        },
    };
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

export const storeGatewayAuthConfig = ({
    gateway_url,
    token,
}: GatewayAuthTokenResponse): void => {
    localStorage.setItem(
        LocalStorageKeys.GATEWAY,
        JSON.stringify({ gateway_url: gateway_url.toString(), token })
    );
};

export const getStoredGatewayAuthConfig =
    (): GatewayAuthTokenResponse | null => {
        const config = localStorage.getItem(LocalStorageKeys.GATEWAY);

        return config ? JSON.parse(config) : null;
    };

export const removeGatewayAuthConfig = (): void => {
    localStorage.removeItem(LocalStorageKeys.GATEWAY);
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
