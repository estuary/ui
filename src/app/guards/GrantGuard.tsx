import { Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { getDirectiveByToken, submitDirective } from 'api/directives';
import MessageWithLink from 'components/content/MessageWithLink';
import FullPageSpinner from 'components/fullPage/Spinner';
import FullPageWrapper from 'directives/FullPageWrapper';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { jobStatusPoller } from 'services/supabase';
import { AppliedDirective, BaseComponentProps } from 'types';
import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'grant';

//  We need to pass the grants mutate and NOT the directive guards mutate
//  because The Grant guard is kind of like a "child guard" of the Tenant
//  guard.

interface Props extends BaseComponentProps {
    token: string;
    grantsMutate: any;
}

const redeemGrant = async (
    token: string,
    directive: AppliedDirective<any>,
    grantsMutate: any,
    setServerError: Dispatch<SetStateAction<string | null>>
) => {
    const directiveResponse = await getDirectiveByToken(token);

    if (directiveResponse.error) {
        setServerError((directiveResponse.error as PostgrestError).message);
    } else if (directiveResponse.data && directiveResponse.data.length > 0) {
        const response = await submitDirective(
            SELECTED_DIRECTIVE,
            directive,
            directiveResponse.data[0].spec.grantedPrefix
        );

        if (response.error) {
            setServerError((response.error as PostgrestError).message);
        }

        const data = response.data[0];

        jobStatusPoller(
            jobStatusQuery(data),
            async () => {
                trackEvent(`${SELECTED_DIRECTIVE}:Complete`, directive);

                void grantsMutate();
            },
            async (payload: any) => {
                trackEvent(`${SELECTED_DIRECTIVE}:Error`, directive);

                setServerError(payload.job_status.error);
            }
        );
    } else {
        setServerError('No directive on file with specified token');
    }
};

function GrantGuard({ children, token, grantsMutate }: Props) {
    const [processUninitiated, setProcessUninitiated] = useState<boolean>(true);
    const [serverError, setServerError] = useState<string | null>(null);

    const { directive, loading, status, error } = useDirectiveGuard(
        SELECTED_DIRECTIVE,
        { token }
    );

    if ((loading || status !== 'fulfilled') && !serverError && !error) {
        if (processUninitiated && directive) {
            setProcessUninitiated(false);

            void redeemGrant(token, directive, grantsMutate, setServerError);
        }

        return <FullPageSpinner />;
    } else if (serverError || error || status !== 'fulfilled') {
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
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default GrantGuard;
