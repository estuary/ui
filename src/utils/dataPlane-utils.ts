export enum ErrorFlags {
    // DEBUGGING = 'parsing jwt:', // useful for testing just add it to the onError
    OPERATION_INVALID = 'Unauthorized',
    TOKEN_EXPIRED = 'token is expired',
    TOKEN_INVALID = 'Authentication failed',
    TOKEN_NOT_FOUND = 'Unauthenticated',
}
