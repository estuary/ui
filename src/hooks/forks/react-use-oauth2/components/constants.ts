// Heavily edited version of https://github.com/tasoskakour/react-use-oauth2
export const POPUP_HEIGHT = 700;
export const POPUP_WIDTH = 600;
export const OAUTH_RESPONSE = 'estuary.oauth2-response';
export const OAUTH_BROADCAST_CHANNEL = 'estuary.oauth2-response-channel';
export const MESSAGE_KEY = 'message';

// How long we wait for the pop-up to report back once it reads as closed.
//  COOP-severed handles (ex: Microsoft login) read as closed while the user
//  is still logging in, so this needs to allow for a full login with MFA.
export const POPUP_RESULT_TIMEOUT = 180000;
