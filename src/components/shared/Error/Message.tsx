import { Box, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage, useIntl } from 'react-intl';
import { DEFAULT_POLLER_ERROR_MESSAGE_KEY } from 'services/supabase';
import Details from './Details';
import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
}

function Message({ error }: Props) {
    console.log('Message', error);
    const intl = useIntl();
    const pollerFailure = error.message === DEFAULT_POLLER_ERROR_MESSAGE_KEY;

    const foo = intl.formatMessage({ id: error.message });

    console.log('foo', foo);

    const message = !pollerFailure
        ? error.message
        : intl.formatMessage({ id: error.message });

    return (
        <>
            <Box>
                <MessageWithLink messageID="error.message" />
            </Box>

            <Stack direction="row" spacing={1}>
                <Typography sx={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="error.messageLabel" />
                </Typography>

                <Typography>{message}</Typography>
            </Stack>
            <Details error={error} />
        </>
    );
}

export default Message;
