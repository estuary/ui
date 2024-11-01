import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import SchemaModeForm from './Form';
import { SchemaModeFormProps } from './types';

function SchemaMode({ bindingIndex = -1 }: SchemaModeFormProps) {
    const intl = useIntl();

    if (bindingIndex > -1) {
        return null;
    }

    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography variant="h6">
                            {intl.formatMessage({
                                id: 'schemaMode.header',
                            })}
                        </Typography>
                    </Stack>

                    <Typography>
                        {intl.formatMessage({
                            id: 'schemaMode.message',
                        })}
                    </Typography>
                </Stack>

                <SchemaModeForm bindingIndex={bindingIndex} />
            </Stack>
        </Box>
    );
}

export default SchemaMode;
