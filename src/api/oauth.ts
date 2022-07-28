import { FUNCTIONS, invokeSupabase } from 'services/supabase';

const OPERATIONS = {
    AUTH_URL: 'auth-url',
    ACCESS_TOKEN: 'access-token',
    ENCRYPT_CONFIG: 'encrypt-config',
};

export interface AccessTokenResponse {
    [k: string]: any;
}

export interface AuthURLResponse {
    url: string;
    state: string;
}

export const authURL = (connectorId: string) => {
    return invokeSupabase<AuthURLResponse>(FUNCTIONS.OAUTH, {
        operation: OPERATIONS.AUTH_URL,
        connector_id: connectorId,
        redirect_uri: `${window.location.origin}/oauth`,
    });
};

export const accessToken = (state: string, code: string) => {
    return invokeSupabase<AccessTokenResponse>(FUNCTIONS.OAUTH, {
        operation: OPERATIONS.ACCESS_TOKEN,
        redirect_uri: `${window.location.origin}/oauth`,
        state,
        code,
    });
};

export const encryptConfig = (
    connectorId: string,
    config: any,
    schema: any
) => {
    return invokeSupabase<any>(FUNCTIONS.OAUTH, {
        operation: OPERATIONS.ENCRYPT_CONFIG,
        connectorId,
        config,
        schema,
    });
};
