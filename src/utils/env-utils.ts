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

// Base URL for the Estuary API. Endpoint paths live at each call site so the
// host is configured in exactly one place.
const requireEstuaryApiUrl = (): string => {
    const estuaryApiUrl = import.meta.env.VITE_ESTUARY_API_URL;

    if (estuaryApiUrl) {
        return estuaryApiUrl;
    } else {
        throw new Error('Missing Estuary API base URL: VITE_ESTUARY_API_URL');
    }
};

export const getGqlUrl = (): string => `${requireEstuaryApiUrl()}/api/graphql`;

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

export const getPostHogSettings = () => {
    if (import.meta.env.VITE_PH_ENABLED === ENABLED) {
        const settings = {
            apiHost: import.meta.env.VITE_PH_API_HOST ?? null,
            publicToken: import.meta.env.VITE_PH_PUBLIC_API_TOKEN ?? null,
            idUser: import.meta.env.VITE_PH_ID_USER === ENABLED,
        };

        if (Boolean(settings.apiHost && settings.publicToken)) {
            return settings;
        }
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

export const getTaskAuthorizationSettings = () => ({
    taskAuthorizationEndpoint: `${requireEstuaryApiUrl()}/authorize/user/task`,
});

export const getCollectionAuthorizationSettings = () => ({
    collectionAuthorizationEndpoint: `${requireEstuaryApiUrl()}/authorize/user/collection`,
});

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

export const getEntityStatusSettings = () => ({
    entityStatusBaseEndpoint: `${requireEstuaryApiUrl()}/api/v1/catalog/status`,
});
