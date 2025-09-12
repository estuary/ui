import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';

interface Props {
    message: string;
    linkOptions?: ExternalLinkOptions;
}

// We will only show special messaging for errors that are can actually tell the user
//      what to do in hopes to fix it. So right now that is just when there are possible
//      network issues Q4 2023
function Instructions({ linkOptions, message }: Props) {
    const intl = useIntl();
    const messageIntlKey = checkErrorMessage(FAILED_TO_FETCH, message)
        ? 'error.reason.fetchFailed'
        : null;

    if (!messageIntlKey) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography>
                {intl.formatMessage({ id: messageIntlKey })}
            </Typography>

            <MessageWithLink
                messageID="error.instructions"
                linkOptions={linkOptions}
            />
        </Stack>
    );
}

export default Instructions;
