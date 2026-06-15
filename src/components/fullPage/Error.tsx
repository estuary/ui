import type { ReactElement } from 'react';
import type { ErrorDetails } from 'src/components/shared/Error/types';

import { useMemo } from 'react';

import { Button, Divider, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';

import FullPageWrapper from 'src/app/FullPageWrapper';
import MessageWithLink from 'src/components/content/MessageWithLink';
import Error from 'src/components/shared/Error';
import { supabaseClient } from 'src/context/GlobalProviders';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface Props {
    error: ErrorDetails;
    disableMessageWrapping?: boolean;
    message?: ReactElement;
    title?: ReactElement | string;
}
function FullPageError({
    disableMessageWrapping,
    error,
    message,
    title,
}: Props) {
    useMount(() => {
        logRocketEvent(CustomEvents.FULL_PAGE_ERROR_DISPLAYED);
    });

    const messageContent = useMemo(() => {
        if (message) {
            if (disableMessageWrapping) {
                return message;
            }

            return <Typography variant="subtitle1">{message}</Typography>;
        }

        return null;
    }, [disableMessageWrapping, message]);

    return (
        <FullPageWrapper>
            <Stack spacing={2}>
                <Typography variant="h5">
                    {title ? (
                        title
                    ) : (
                        <FormattedMessage id="common.failedFetch" />
                    )}
                </Typography>
                {messageContent}
                <Typography variant="subtitle1">
                    <MessageWithLink messageID="fullPage.instructions" />
                </Typography>

                {/* A full-page error replaces the layout — including the nav's
                    logout button. Every caller is behind auth, so always offer
                    logout as an escape; signing out and back in clears stale
                    check/hydration failures. */}
                <Button
                    variant="outlined"
                    onClick={() => {
                        void supabaseClient.auth.signOut();
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    <FormattedMessage id="cta.logout" />
                </Button>

                <Divider />
                <Error error={error} condensed />
            </Stack>
        </FullPageWrapper>
    );
}

export default FullPageError;
