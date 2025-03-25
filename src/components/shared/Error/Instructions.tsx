import { Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
import { FAILED_TO_FETCH, checkErrorMessage } from 'services/shared';
import type { ExternalLinkOptions } from '../ExternalLink';

interface Props {
    message: string;
    linkOptions?: ExternalLinkOptions;
}

// We will only show special messaging for errors that are can actually tell the user
//      what to do in hopes to fix it. So right now that is just when there are possible
//      network issues Q4 2023
function Instructions({ linkOptions, message }: Props) {
    const messageID = checkErrorMessage(FAILED_TO_FETCH, message)
        ? 'error.reason.fetchFailed'
        : null;

    if (!messageID) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography>
                <FormattedMessage id={messageID} />
            </Typography>

            <MessageWithLink
                messageID="error.instructions"
                linkOptions={linkOptions}
            />
        </Stack>
    );
}

export default Instructions;
