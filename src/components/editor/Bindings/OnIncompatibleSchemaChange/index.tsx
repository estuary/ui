import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import OnIncompatibleSchemaChangeForm from './Form';
import { OnIncompatibleSchemaChangeFormProps } from './types';

function OnIncompatibleSchemaChange({
    bindingIndex = -1,
}: OnIncompatibleSchemaChangeFormProps) {
    const intl = useIntl();

    if (bindingIndex < 0) {
        return null;
    }

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
                    <OnIncompatibleSchemaChangeForm
                        bindingIndex={bindingIndex}
                    />
                </Box>
            </Stack>
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
