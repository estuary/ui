import { Box, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { BackfillSectionProps } from './types';

export default function BackfillSection({
    children,
    isBinding,
}: BackfillSectionProps) {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3 }}>
            <Typography
                style={{ marginBottom: 8 }}
                variant={isBinding ? 'h6' : 'formSectionHeader'}
            >
                {intl.formatMessage({
                    id: 'workflows.collectionSelector.manualBackfill.header',
                })}
            </Typography>

            {children}
        </Box>
    );
}
