import { FormattedMessage, useIntl } from 'react-intl';

import { Box, Stack, Typography } from '@mui/material';

import MessageWithLink from 'components/content/MessageWithLink';

import { logRocketConsole } from 'services/logrocket';

import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
}

function Message({ error }: Props) {
    logRocketConsole('Error message displayed', error);

    const intl = useIntl();

    // Check if the message object is coming from the server
    //  Easiest check I could think of. Our shortest keys are
    //      `cta.foo` which can look a lot like how Supabase returns
    //      errors when fetching wrong keys from a table (`tableName.col`)
    //      so we can not use a RegEx like originally planned.
    //  Code seems to almost always come back.
    const messageFromServer =
        typeof error === 'object' && error.hasOwnProperty('code');

    // We do not need to translate messages from Supabase as they comeback readable
    const message = messageFromServer
        ? error.message
        : intl.formatMessage({ id: error.message });

    if (!messageFromServer) {
        return (
            <Box sx={{ my: 1 }}>
                <Typography>{message}</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            <Box>
                <MessageWithLink messageID="error.message" />
            </Box>
            <Stack direction="row" spacing={1}>
                <Typography sx={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="error.messageLabel" />
                </Typography>

                <Typography>{message}</Typography>
            </Stack>
        </Stack>
    );
}

export default Message;
