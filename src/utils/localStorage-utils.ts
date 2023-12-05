import { GatewayAuthTokenResponse } from 'types';

export enum LocalStorageKeys {
    COLOR_MODE = 'estuary.color-mode',
    NAVIGATION_SETTINGS = 'estuary.navigation-settings',
    GATEWAY = 'estuary.gateway-auth-config',
    TOKEN_INVALID = 'estuary.token-invalid',
}

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
