import { useEffect, useMemo, useState } from 'react';

import { OptionsObject, useSnackbar } from 'notistack';
import { AppliedDirective } from 'types';
import { useIntl } from 'react-intl';

import { PostgrestError } from '@supabase/postgrest-js';

import { exchangeBearerToken } from 'api/directives';

import { DIRECTIVES } from 'directives/shared';
import { UserClaims } from 'directives/types';

import useAppliedDirectives from 'hooks/useAppliedDirectives';

const snackbarSettings: OptionsObject = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
    },
    preventDuplicate: true,
    variant: 'info',
};

const useDirectiveGuard = (
    selectedDirective: keyof typeof DIRECTIVES,
    options?: { forceNew?: boolean; token?: string; hideAlert?: boolean }
) => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    // const [fetching, setFetching] = useState(false);
    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const { appliedDirective, isValidating, mutate, error } =
        useAppliedDirectives(selectedDirective);

    const calculateStatus = useMemo(
        () => DIRECTIVES[selectedDirective].calculateStatus,
        [selectedDirective]
    );

    const directiveState = useMemo(() => {
        if (isValidating) {
            return null;
        }

        if (error) {
            setServerError(error);
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

    const [freshDirective, setFreshDirective] =
        useState<AppliedDirective<UserClaims> | null>(null);

    useEffect(() => {
        // Need to exchange for a fresh directive because:
        //   new&fulfilled : user has submitted a tenant but wants to try to submit another
        //      The backend checks if they are allowed to create multiple tenants
        //   unfulfilled : user never exchanged a token before
        //   outdated    : user has exchanged AND submitted something before
        if (
            (options?.forceNew && directiveState === 'fulfilled') ||
            directiveState === 'unfulfilled' ||
            directiveState === 'outdated'
        ) {
            if (options?.token) {
                DIRECTIVES[selectedDirective].token = options.token;
            }

            if (DIRECTIVES[selectedDirective].token) {
                const fetchDirective = async () => {
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
            (directiveState === 'in progress' || directiveState === 'waiting')
        ) {
            enqueueSnackbar(
                intl.formatMessage({
                    id: 'directives.returning',
                }),
                snackbarSettings
            );
        }

        // Show a message to remind the user why they are seeing the directive page
        if (directiveState === 'errored' && serverError?.message) {
            enqueueSnackbar(serverError.message, {
                ...snackbarSettings,
                variant: 'error',
            });
        }
    }, [
        directiveState,
        enqueueSnackbar,
        intl,
        options?.forceNew,
        options?.token,
        options?.hideAlert,
        selectedDirective,
        serverError,
    ]);

    return useMemo(() => {
        if (directiveState === null) {
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
                status: directiveState,
                mutate,
                error: serverError,
            };
        }
    }, [appliedDirective, directiveState, freshDirective, mutate, serverError]);
};

export default useDirectiveGuard;
