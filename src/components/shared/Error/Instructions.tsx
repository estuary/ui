import { Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
import { FAILED_TO_FETCH, retryAfterFailure } from 'services/shared';

interface Props {
    message: string;
}

function Instructions({ message }: Props) {
    const messageID =
        message.toLowerCase() === FAILED_TO_FETCH
            ? 'error.reason.fetchFailed'
            : retryAfterFailure(message)
            ? 'error.reason.retry'
            : 'error.reason';

    return (
        <Stack spacing={1}>
            <Typography>
                <FormattedMessage id={messageID} />
            </Typography>
            <MessageWithLink messageID="error.instructions" />
        </Stack>
    );
}

export default Instructions;
