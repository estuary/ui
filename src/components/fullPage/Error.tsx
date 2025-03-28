import type { ReactElement} from 'react';
import { useMemo } from 'react';

import { Divider, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';

import FullPageWrapper from 'src/app/FullPageWrapper';
import MessageWithLink from 'src/components/content/MessageWithLink';
import Error from 'src/components/shared/Error';
import type { ErrorDetails } from 'src/components/shared/Error/types';
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
                <Divider />
                <Error error={error} condensed />
            </Stack>
        </FullPageWrapper>
    );
}

export default FullPageError;
