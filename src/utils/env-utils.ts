declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
        } | null;
    }
}

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
    const showEmail = process.env.REACT_APP_SHOW_EMAIL_LOGIN === 'true';
    const showOIDC = process.env.REACT_APP_SHOW_OIDC_LOGIN === 'true';
    const showGoogle = process.env.REACT_APP_SHOW_OIDC_LOGIN_GOOGLE === 'true';

    return {
        showEmail,
        showOIDC,
        showGoogle,
    };
};
