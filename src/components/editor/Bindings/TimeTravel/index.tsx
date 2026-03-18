import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import TimeTravelForm from 'src/components/editor/Bindings/TimeTravel/Form';

interface Props {
    bindingUUID: string;
    collectionName: string;
}

function TimeTravel({ bindingUUID, collectionName }: Props) {
    const intl = useIntl();
    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography style={{ fontWeight: 500 }}>
                            {intl.formatMessage({
                                id: 'notBeforeNotAfter.header',
                            })}
                        </Typography>
                    </Stack>

                    <Typography>
                        {intl.formatMessage({
                            id: 'notBeforeNotAfter.message',
                        })}
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
