import { GatewayAuthTokenResponse } from 'types';

export enum LocalStorageKeys {
    COLOR_MODE = 'estuary.color-mode',
    GATEWAY = 'estuary.gateway-auth-config',
    MARKETPLACE_VERIFY = 'estuary.marketplace-verify',
    NAVIGATION_SETTINGS = 'estuary.navigation-settings',
    TABLE_SETTINGS = 'estuary.table-settings',
    SIDE_PANEL_DOCS = 'estuary.side-panel-docs',
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
