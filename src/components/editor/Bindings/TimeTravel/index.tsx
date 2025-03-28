import { Box, Stack, Typography } from '@mui/material';

import TimeTravelForm from './Form';
import { FormattedMessage } from 'react-intl';

interface Props {
    bindingUUID: string;
    collectionName: string;
}

function TimeTravel({ bindingUUID, collectionName }: Props) {
    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography style={{ fontWeight: 500 }}>
                            <FormattedMessage id="notBeforeNotAfter.header" />
                        </Typography>
                    </Stack>

                    <Typography>
                        <FormattedMessage id="notBeforeNotAfter.message" />
                    </Typography>
                </Stack>

                <Box sx={{ maxWidth: 'fit-content' }}>
                    <TimeTravelForm
                        bindingUUID={bindingUUID}
                        collectionName={collectionName}
                    />
                </Box>
            </Stack>
        </Box>
    );
}

export default TimeTravel;
