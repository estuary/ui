import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import TimeTravelForm from './Form';

interface Props {
    collectionName: string;
}

function TimeTravel({ collectionName }: Props) {
    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography variant="h6">
                            <FormattedMessage id="notBeforeNotAfter.header" />
                        </Typography>
                    </Stack>

                    <Typography>
                        <FormattedMessage id="notBeforeNotAfter.message" />
                    </Typography>
                </Stack>

                <TimeTravelForm collectionName={collectionName} />
            </Stack>
        </Box>
    );
}

export default TimeTravel;
