import type { BackfillDataflowOptionProps } from 'src/components/editor/Bindings/Backfill/types';

import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';

function BackfillDataFlowOption({ disabled }: BackfillDataflowOptionProps) {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();

    if (backfillCount < 1) {
        return null;
    }

    return (
        <Box sx={{ mt: 3 }}>
            <AlertBox
                sx={{
                    maxWidth: 'fit-content',
                }}
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'workflows.collectionSelector.dataFlowBackfill.header',
                })}
            >
                <Typography component="div">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.dataFlowBackfill.message',
                    })}
                </Typography>
            </AlertBox>
        </Box>
    );
}

export default BackfillDataFlowOption;
