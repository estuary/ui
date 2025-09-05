import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import Message from 'src/components/shared/Error/Message';
import { BASE_ERROR } from 'src/services/supabase';

function OffsetNotYetAvailable() {
    const intl = useIntl();
    return (
        <Stack spacing={2}>
            <Message
                error={{
                    ...BASE_ERROR,
                    message: intl.formatMessage({
                        id: 'ops.errors.offsetNot.title',
                    }),
                }}
            />
            <Typography>
                {intl.formatMessage({ id: 'ops.errors.offsetNot.details' })}
            </Typography>

            <MessageWithLink messageID="ops.errors.offsetNot.instructions" />
        </Stack>
    );
}

export default OffsetNotYetAvailable;
