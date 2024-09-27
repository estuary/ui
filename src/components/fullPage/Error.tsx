import { Divider, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import Error from 'components/shared/Error';
import { ErrorDetails } from 'components/shared/Error/types';
import FullPageWrapper from 'app/FullPageWrapper';
import { ReactElement, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';

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
                <Divider />
                <Error error={error} condensed />
            </Stack>
        </FullPageWrapper>
    );
}

export default FullPageError;
