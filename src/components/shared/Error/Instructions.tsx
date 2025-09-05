import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { showAsTechnicalDifficulties } from 'src/services/shared';

interface Props {
    message: string;
    linkOptions?: ExternalLinkOptions;
}

// We will only show special messaging for errors that are can actually tell the user
//      what to do in hopes to fix it. So right now that is just when there are possible
//      network issues Q4 2023
function Instructions({ linkOptions, message }: Props) {
    console.log(
        'showAsTechnicalDifficulties(message)',
        showAsTechnicalDifficulties(message)
    );

    const messageID = showAsTechnicalDifficulties(message)
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
