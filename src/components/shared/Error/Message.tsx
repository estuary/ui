import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    logRocketConsole,
    logRocketEvent,
    retryAfterFailure,
} from 'services/shared';
import { CustomEvents } from 'services/types';
import { ExternalLinkOptions } from '../ExternalLink';
import Instructions from './Instructions';
import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
    linkOptions?: ExternalLinkOptions;
}

const FALLBACK = 'error.fallBack';

function Message({ error, linkOptions }: Props) {
    // We fire an event AND log so we can find these but LR
    //  does not allow unbounded data to be passed into an event
    //  so the logging allows us to see what error was passed in
    logRocketEvent(CustomEvents.ERROR_DISPLAYED);
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

    // There is a small chance this can happen so adding custom event to track it
    // Happened before when journal data hook wasn't catching errors
    const id = error.message ?? FALLBACK;
    if (id === FALLBACK) {
        logRocketEvent(CustomEvents.ERROR_MISSING_MESSAGE);
    }

    // We do not need to translate messages from Supabase as they comeback readable
    const message = displayErrorOnly
        ? error.message
        : intl.formatMessage({ id });

    if (!displayErrorOnly) {
        return (
            <Box sx={{ my: 1 }}>
                <Typography>{message}</Typography>
            </Box>
        );
    }

    return (
        <Stack>
            <Instructions message={message} linkOptions={linkOptions} />
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
