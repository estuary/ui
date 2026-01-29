import type { PostgrestError } from '@supabase/postgrest-js';
import type { DirectiveStates, UserClaims } from 'src/directives/types';
import type { AppliedDirective } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { exchangeBearerToken } from 'src/api/directives';
import { DIRECTIVES } from 'src/directives/shared';
import useAppliedDirectives from 'src/hooks/useAppliedDirectives';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { snackbarSettings } from 'src/utils/notification-utils';

const useDirectiveGuard = (
    selectedDirective: keyof typeof DIRECTIVES,
    options?: { forceNew?: boolean; token?: string; hideAlert?: boolean }
) => {
    logRocketConsole('useDirectiveGuard', selectedDirective);

    const { appliedDirective, isValidating, mutate, error } =
        useAppliedDirectives(selectedDirective, options?.token);

    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const [calculatedState, setCalculatedState] =
        useState<DirectiveStates | null>(null);
    const [freshDirective, setFreshDirective] =
        useState<AppliedDirective<UserClaims> | null>(null);
    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const calculateStatus = useMemo(
        () => DIRECTIVES[selectedDirective].calculateStatus,
        [selectedDirective]
    );

    const directiveState = useMemo(() => {
        if (isValidating) {
            return null;
        }

        if (error) {
            return 'errored';
        }

        if (options?.token && serverError) {
            return 'errored';
        }

        return calculateStatus(appliedDirective);
    }, [
        error,
        calculateStatus,
        appliedDirective,
        isValidating,
        options?.token,
        serverError,
    ]);

    useEffect(() => {
        setServerError(error ?? null);
    }, [error]);

    // The memo above was getting called more often than planned and I think it might have
    //  been part of https://github.com/estuary/ui/issues/999. So the thinking here is that
    //  we only really care to update if the value actually changed and that might prevent
    //  extra hook calls that end up getting "confused"
    useEffect(() => {
        logRocketEvent(CustomEvents.DIRECTIVE_GUARD_STATE, {
            state: directiveState ?? 'null',
        });
        setCalculatedState(directiveState);
    }, [directiveState]);

    useEffect(() => {
        // Need to exchange for a fresh directive because:
        //   new&fulfilled : user has submitted a tenant but wants to try to submit another
        //      The backend checks if they are allowed to create multiple tenants
        //   unfulfilled : user never exchanged a token before
        //   outdated    : user has exchanged AND submitted something before
        if (
            (options?.forceNew && calculatedState === 'fulfilled') ||
            calculatedState === 'unfulfilled' ||
            calculatedState === 'outdated'
        ) {
            if (options?.token) {
                DIRECTIVES[selectedDirective].token = options.token;
            }

            if (DIRECTIVES[selectedDirective].token) {
                const fetchDirective = async () => {
                    logRocketEvent(CustomEvents.DIRECTIVE_EXCHANGE_TOKEN);
                    return exchangeBearerToken(
                        DIRECTIVES[selectedDirective].token
                    );
                };

                fetchDirective()
                    .then((response) => {
                        if (response.data) {
                            setFreshDirective(response.data.applied_directive);
                        }

                        setServerError(response.error ?? null);
                    })
                    .catch((fetchError) => {
                        setFreshDirective(null);
                        setServerError(fetchError);
                    });
            }
        }

        // Show a message to remind the user why they are seeing the directive page
        if (
            !options?.hideAlert &&
            (calculatedState === 'in progress' || calculatedState === 'waiting')
        ) {
            enqueueSnackbar(
                intl.formatMessage({
                    id: 'directives.returning',
                }),
                snackbarSettings
            );
        }

        // Show a message to remind the user why they are seeing the directive page
        if (calculatedState === 'errored' && serverError?.message) {
            enqueueSnackbar(serverError.message, {
                ...snackbarSettings,
                variant: 'error',
            });
        }
    }, [
        calculatedState,
        enqueueSnackbar,
        intl,
        options?.forceNew,
        options?.token,
        options?.hideAlert,
        selectedDirective,
        serverError,
    ]);

    return useMemo(() => {
        if (calculatedState === null) {
            return {
                loading: true,
                directive: null,
                status: null,
                mutate: null,
                error: null,
            };
        } else {
            return {
                loading: false,
                directive: freshDirective ? freshDirective : appliedDirective,
                status: calculatedState,
                mutate,
                error: serverError,
            };
        }
    }, [
        appliedDirective,
        calculatedState,
        freshDirective,
        mutate,
        serverError,
    ]);
};

export default useDirectiveGuard;
