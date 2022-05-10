declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
        } | null;
    }
}

const ENABLED = 'true';

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

export const getUrls = () => {
    const privacyPolicy = process.env.REACT_APP_URLS_PRIVACY_POLICY;
    const termsOfService = process.env.REACT_APP_URLS_TERMS_OF_SERVICE;

    if (privacyPolicy && termsOfService) {
        return {
            privacyPolicy,
            termsOfService,
        };
    } else {
        throw new Error('Missing Privacy or TOS environmental settings.');
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
            enabled: process.env.REACT_APP_LOGROCKET_ID_USER,
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
