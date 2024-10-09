import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import IncompatibleSchemaForm from './Form';

interface Props {
    bindingUUID: string;
    collectionName: string;
}

function IncompatibleSchemaChange({ bindingUUID, collectionName }: Props) {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography variant="h6">
                            {intl.formatMessage({
                                id: 'incompatibleSchemaChange.header',
                            })}
                        </Typography>
                    </Stack>

                    <Typography>
                        {intl.formatMessage({
                            id: 'incompatibleSchemaChange.message',
                        })}
                    </Typography>
                </Stack>

                <Box>
                    <IncompatibleSchemaForm
                        bindingUUID={bindingUUID}
                        collectionName={collectionName}
                    />
                </Box>
            </Stack>
        </Box>
    );
}

export default IncompatibleSchemaChange;
