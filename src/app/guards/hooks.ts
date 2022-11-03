import { exchangeBearerToken } from 'api/directives';
import { DIRECTIVES, DirectiveStates } from 'directives/shared';
import { UserClaims } from 'directives/types';
import useAppliedDirectives from 'hooks/useAppliedDirectives';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { AppliedDirective } from 'types';

const useDirectiveGuard = (selectedDirective: keyof typeof DIRECTIVES) => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const { appliedDirective, isValidating, mutate } =
        useAppliedDirectives(selectedDirective);

    const calculateStatus = useMemo(
        () => DIRECTIVES[selectedDirective].calculateStatus,
        [selectedDirective]
    );

    const directiveState = useMemo(() => {
        if (isValidating) {
            return null;
        }

        return calculateStatus(appliedDirective);
    }, [isValidating, appliedDirective, calculateStatus]);

    console.log(`${selectedDirective} directiveState`, {
        directiveState,
    });

    const [freshDirective, setFreshDirective] =
        useState<AppliedDirective<UserClaims> | null>(null);
    useEffect(() => {
        if (directiveState === DirectiveStates.UNFULFILLED) {
            const fetchDirective = async () => {
                console.log('fetching a fresh directive');
                return exchangeBearerToken(DIRECTIVES[selectedDirective].token);
            };

            fetchDirective()
                .then((response) => {
                    if (response.error) {
                        console.log('error fetching', response.error);
                    } else {
                        setFreshDirective(response.data.applied_directive);
                    }
                })
                .catch(() => {});
        } else if (directiveState === DirectiveStates.IN_PROGRESS) {
            enqueueSnackbar(
                intl.formatMessage({
                    id: 'directives.returning',
                }),
                {
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    preventDuplicate: true,
                    variant: 'info',
                }
            );
        }
    }, [directiveState, enqueueSnackbar, intl, selectedDirective]);

    return useMemo(() => {
        if (directiveState === null) {
            return {
                loading: true,
                directive: null,
                status: null,
                mutate: null,
            };
        } else {
            return {
                loading: false,
                directive: freshDirective ? freshDirective : appliedDirective,
                status: directiveState,
                mutate,
            };
        }
    }, [appliedDirective, directiveState, freshDirective, mutate]);
};

export default useDirectiveGuard;
