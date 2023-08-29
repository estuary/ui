import { Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { getDirectiveByToken } from 'api/directives';
import { authenticatedRoutes } from 'app/routes';
import MessageWithLink from 'components/content/MessageWithLink';
import FullPageSpinner from 'components/fullPage/Spinner';
import AcceptGrant from 'directives/AcceptGrant';
import FullPageWrapper from 'directives/FullPageWrapper';

import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Navigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { HomePageErrors } from 'components/login/shared';
import useDirectiveGuard from '../hooks';

const SELECTED_DIRECTIVE = 'grant';

interface Props {
    grantToken: string;
}

function GrantGuardProcessor({ grantToken }: Props) {
    const [processUninitiated, setProcessUninitiated] = useState<boolean>(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [prefix, setPrefix] = useState<string | null | undefined>(null);
    const [capability, setCapability] = useState<string | null | undefined>(
        null
    );

    const {
        directive,
        loading,
        status,
        mutate,
        error: configError,
    } = useDirectiveGuard(SELECTED_DIRECTIVE, { token: grantToken });

    console.log('=', { directive, loading, status, mutate, configError });

    const homePageError = useMemo(() => {
        if (grantToken && processUninitiated) {
            if (directive?.directives?.uses_remaining === null) {
                return HomePageErrors.GRANT_TOKEN_NOT_APPLIED_MULTI_USE;
            }
            if (directive?.directives?.uses_remaining === 0) {
                return HomePageErrors.GRANT_TOKEN_NOT_APPLIED_SINGLE_USE;
            }
        }
        return null;
    }, [directive?.directives?.uses_remaining, grantToken, processUninitiated]);

    if (grantToken && status !== 'fulfilled') {
        if (
            (loading ||
                status === null ||
                prefix === null ||
                capability === null) &&
            !serverError &&
            !configError
        ) {
            if (processUninitiated && directive) {
                setProcessUninitiated(false);

                void getDirectiveByToken(grantToken).then(
                    (response) => {
                        if (response.error) {
                            setServerError(
                                (response.error as PostgrestError).message
                            );
                        } else if (response.data && response.data.length > 0) {
                            const {
                                grantedPrefix,
                                capability: grantedCapability,
                            } = response.data[0].spec;

                            setPrefix(grantedPrefix);
                            setCapability(grantedCapability);
                        } else {
                            setServerError(
                                'No directive on file with specified token'
                            );
                        }
                    },
                    (error) => setServerError(error)
                );
            }

            return <FullPageSpinner />;
        } else if (
            serverError ||
            configError ||
            prefix === undefined ||
            capability === undefined
        ) {
            return (
                <FullPageWrapper>
                    <Stack spacing={2}>
                        <Typography variant="h5" align="center">
                            <FormattedMessage id="tenant.grantDirective.error.header" />
                        </Typography>

                        <Typography>
                            <FormattedMessage id="tenant.grantDirective.error.message" />
                        </Typography>

                        <MessageWithLink messageID="tenant.grantDirective.error.message.help" />
                    </Stack>
                </FullPageWrapper>
            );
        } else {
            return (
                <FullPageWrapper>
                    {prefix && capability ? (
                        <AcceptGrant
                            directive={directive}
                            mutate={mutate}
                            grantedPrefix={prefix}
                            grantedCapability={capability}
                        />
                    ) : (
                        <Stack spacing={2}>
                            <Typography variant="h5" align="center">
                                <FormattedMessage id="tenant.grantDirective.error.header" />
                            </Typography>

                            <Typography>
                                <FormattedMessage id="tenant.grantDirective.error.message" />
                            </Typography>

                            <MessageWithLink messageID="tenant.grantDirective.error.message.help" />
                        </Stack>
                    )}
                </FullPageWrapper>
            );
        }
    } else {
        // See if we need to add the param to show an error
        const navigateToPath = homePageError
            ? getPathWithParams(authenticatedRoutes.home.path, {
                  [GlobalSearchParams.HOME_PAGE_ERROR]: homePageError,
              })
            : authenticatedRoutes.home.path;
        return <Navigate to={navigateToPath} replace />;
    }
}

export default GrantGuardProcessor;
