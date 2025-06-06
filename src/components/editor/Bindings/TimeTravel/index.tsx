import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import TimeTravelForm from 'src/components/editor/Bindings/TimeTravel/Form';

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
