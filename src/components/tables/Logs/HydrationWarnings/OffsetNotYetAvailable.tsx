import { Box, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';

function OffsetNotYetAvailable() {
    const intl = useIntl();
    return (
        <Stack spacing={1}>
            <Box>
                {intl.formatMessage({
                    id: 'ops.hydrationWarning.offsetNot.details',
                })}
            </Box>

            <MessageWithLink messageID="ops.hydrationWarning.offsetNot.instructions" />
        </Stack>
    );
}

export default OffsetNotYetAvailable;
