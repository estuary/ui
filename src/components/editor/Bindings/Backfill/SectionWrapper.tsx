import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { BaseComponentProps } from 'types';

export default function BackfillSection({ children }: BaseComponentProps) {
    const intl = useIntl();

    return (
        <Box sx={{ mb: 4, mt: 3 }}>
            <Typography
                component="div"
                style={{ marginBottom: 8 }}
                variant="formSectionHeader"
            >
                {intl.formatMessage({
                    id: 'workflows.collectionSelector.manualBackfill.header',
                })}
            </Typography>

            <Stack spacing={3}>{children}</Stack>
        </Box>
    );
}
