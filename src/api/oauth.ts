import { OAUTH_OPERATIONS } from 'src/api/shared';
import { FUNCTIONS, invokeSupabase } from 'src/services/supabase';

const OAUTH_URL_SUFFIX = '/oauth';

export interface AccessTokenResponse {
    [k: string]: any;
}

export interface AuthURLResponse {
    url: string;
    state: string;
    code_verifier: string;
}

export const authURL = (connectorId: string, config: any) => {
    return invokeSupabase<AuthURLResponse>(FUNCTIONS.OAUTH, {
        operation: OAUTH_OPERATIONS.AUTH_URL,
        connector_id: connectorId,
        redirect_uri: `${window.location.origin}${OAUTH_URL_SUFFIX}`,
        config,
    });
};

export const accessToken = (
    state: string,
    code: string,
    config: any,
    code_verifier: string | null
) => {
    return invokeSupabase<AccessTokenResponse>(FUNCTIONS.OAUTH, {
        operation: OAUTH_OPERATIONS.ACCESS_TOKEN,
        redirect_uri: `${window.location.origin}${OAUTH_URL_SUFFIX}`,
        state,
        code,
        config,
        code_verifier,
    });
};

export const encryptConfig = (
    connectorId: string,
    connectorTagId: string,
    config: any
) => {
    return invokeSupabase<any>(FUNCTIONS.OAUTH, {
        operation: OAUTH_OPERATIONS.ENCRYPT_CONFIG,
        connector_id: connectorId,
        connector_tag_id: connectorTagId,
        config,
    });
};
