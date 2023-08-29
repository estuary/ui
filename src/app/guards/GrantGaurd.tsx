import { Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { getDirectiveByToken } from 'api/directives';
import MessageWithLink from 'components/content/MessageWithLink';
import FullPageSpinner from 'components/fullPage/Spinner';
import AcceptGrant from 'directives/AcceptGrant';
import FullPageWrapper from 'directives/FullPageWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BaseComponentProps } from 'types';
import { snackbarSettings } from 'utils/notification-utils';
import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'grant';

function GrantGuard({ children }: BaseComponentProps) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

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
        console.log('Already submitted check', directive);
        if (processUninitiated && directive?.directives?.uses_remaining === 0) {
            enqueueSnackbar(
                intl.formatMessage({
                    id: 'directives.grant.alreadySubmitted',
                }),
                { ...snackbarSettings, variant: 'error' }
            );
        }

        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default GrantGuard;
