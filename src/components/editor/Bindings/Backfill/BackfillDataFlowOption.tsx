import type { BackfillDataflowOptionProps } from 'src/components/editor/Bindings/Backfill/types';

import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Typography,
} from '@mui/material';

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
        <Box sx={{ maxWidth: 'fit-content', mt: 3 }}>
            <AlertBox
                severity="info"
                short
                // title={intl.formatMessage({
                //     id: 'workflows.collectionSelector.dataFlowBackfill.header',
                // })}
            >
                <Typography component="div">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.dataFlowBackfill.message',
                    })}
                </Typography>

                <FormControl>
                    <FormControlLabel
                        control={<Checkbox value="true" checked={false} />}
                        label={`${intl.formatMessage({
                            id: 'workflows.collectionSelector.dataFlowBackfill.input',
                        })}`}
                    />
                    <FormHelperText>
                        {`${intl.formatMessage({
                            id: 'workflows.collectionSelector.dataFlowBackfill.input.description',
                        })}`}
                    </FormHelperText>
                </FormControl>
            </AlertBox>
        </Box>
    );
}

export default BackfillDataFlowOption;
