import { Box, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage, useIntl } from 'react-intl';
import Details from './Details';
import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
}

const TRANSLATE_KEY_RE = new RegExp(/((\w+)\.(\w+))+/);

function Message({ error }: Props) {
    const intl = useIntl();
    const message = TRANSLATE_KEY_RE.test(error.message)
        ? intl.formatMessage({ id: error.message })
        : error.message;

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
