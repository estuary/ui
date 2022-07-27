import { FUNCTIONS, invokeSupabase } from 'services/supabase';

const OPERATIONS = {
    AUTH_URL: 'auth-url',
    ACCESS_TOKEN: 'access-token',
};

export const authURL = (connectorId: string) => {
    return invokeSupabase(FUNCTIONS.OAUTH, {
        operation: OPERATIONS.AUTH_URL,
        connector_id: connectorId,
        redirect_uri: `${window.location.origin}/oauth`,
    });
};

export const accessToken = (state: string, code: string) => {
    return invokeSupabase(FUNCTIONS.OAUTH, {
        operation: OPERATIONS.ACCESS_TOKEN,
        state,
        code,
    });
};
