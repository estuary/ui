import { Box, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { BaseComponentProps } from 'types';

export default function BackfillSection({ children }: BaseComponentProps) {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3 }}>
            <Typography style={{ fontSize: 18, marginBottom: 8 }} variant="h6">
                {intl.formatMessage({
                    id: 'workflows.collectionSelector.manualBackfill.header',
                })}
            </Typography>

            {children}
        </Box>
    );
}
