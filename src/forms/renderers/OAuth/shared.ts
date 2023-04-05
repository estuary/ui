export const NO_PROVIDER = 'noProviderFound';
export const CLIENT_ID = 'client_id';
export const CLIENT_SECRET = 'client_secret';
export const INJECTED = '_injectedDuringEncryption_'; //MUST stay in sync with animate-carnival/supabase/functions/oauth/encrypt-config.ts

// These are injected by the server/encryption call so just setting
//      some value here to pass the validation
export const FAKE_DEFAULTS = {
    [CLIENT_ID]: INJECTED,
    [CLIENT_SECRET]: INJECTED,
};
