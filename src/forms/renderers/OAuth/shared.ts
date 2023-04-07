export const NO_PROVIDER = 'noProviderFound';
export const CLIENT_ID = 'client_id';
export const CLIENT_SECRET = 'client_secret';

//MUST stay in sync with animate-carnival/supabase/functions/oauth/encrypt-config.ts
export const CREDENTIALS = 'credentials';
export const INJECTED = '_injectedDuringEncryption_';

// These are injected by the server/encryption call so just setting
//      some value here to pass the validation
export const INJECTED_VALUES = {
    [CLIENT_ID]: INJECTED,
    [CLIENT_SECRET]: INJECTED,
};
