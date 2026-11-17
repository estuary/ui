import { isAuthError } from '@supabase/supabase-js';
import { CombinedError } from 'urql';

const SESSION_EXPIRED_MESSAGE =
    'Your session expired. Please log in again to continue.';

export function normalizeError(error: unknown) {
    if (isSessionError(error)) {
        return new Error(SESSION_EXPIRED_MESSAGE);
    }
    if (error instanceof CombinedError) {
        return error.graphQLErrors[0] ?? error.networkError;
    }
    if (error instanceof Error) {
        return error;
    }
    if (typeof error === 'string') {
        return new Error(error);
    }

    return new Error('Unknown error');
}

function isSessionError(error: unknown): boolean {
    if (error instanceof CombinedError) {
        if ('response' in error && error.response?.status === 401) {
            return true;
        }
        if ('networkError' in error && isAuthError(error.networkError)) {
            return true;
        }
    }

    return isAuthError(error);
}
