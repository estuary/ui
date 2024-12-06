import { Box, Stack, Typography } from '@mui/material';
import { OnIncompatibleSchemaChangeFormProps } from 'components/incompatibleSchemaChange/types';
import { useIntl } from 'react-intl';
import BindingIncompatibleSchemaChangeForm from './Form';

function OnIncompatibleSchemaChange({
    bindingIndex = -1,
}: OnIncompatibleSchemaChangeFormProps) {
    const intl = useIntl();

    return (
        <Box sx={{ mt: bindingIndex > -1 ? 3 : undefined, mb: 5 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography style={{ fontWeight: 500 }}>
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

                <BindingIncompatibleSchemaChangeForm
                    bindingIndex={bindingIndex}
                />
            </Stack>
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
