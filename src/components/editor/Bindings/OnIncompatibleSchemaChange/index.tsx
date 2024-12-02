import { Box, Stack, Typography } from '@mui/material';
import { OnIncompatibleSchemaChangeFormProps } from 'components/incompatibleSchemaChange/types';
import { useIntl } from 'react-intl';
import BindingIncompatibleSchemaChangeForm from './Form';

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
                        <Typography variant="formSectionHeader">
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
