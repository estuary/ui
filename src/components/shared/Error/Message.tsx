import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { logRocketConsole, retryAfterFailure } from 'services/shared';
import Instructions from './Instructions';
import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
}

function Message({ error }: Props) {
    logRocketConsole('Error message displayed', error);

    const intl = useIntl();

    const failedAfterRetry = retryAfterFailure(error?.message ?? error);

    // Check if we have retried making the call or if we think the message object
    //      is from Supabase
    //  Initially was going to write a RegEx that detects if the mesaage
    //      needs translated. However, Our shortest keys (cta.foo)
    //      can also look a lot like how Supabase returns
    //      errors when fetching wrong keys from a table (tableName.col).
    const displayErrorOnly =
        (typeof error === 'object' && error.hasOwnProperty('code')) ||
        failedAfterRetry;

    // We do not need to translate messages from Supabase as they comeback readable
    const message = displayErrorOnly
        ? error.message
        : intl.formatMessage({ id: error.message });

    if (!displayErrorOnly) {
        return (
            <Box sx={{ my: 1 }}>
                <Typography>{message}</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            <Instructions message={message} />
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
