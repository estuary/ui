import { Box, Stack, Typography } from '@mui/material';

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
                            Time Travel
                        </Typography>
                    </Stack>

                    <Typography>
                        Include only data from before or after a specific time
                        period. This should only be used when first setting up
                        your destination or it will not have an effect.
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
