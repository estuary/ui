import type { BackfillDataflowOptionProps } from 'src/components/editor/Bindings/Backfill/types';

import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

function BackfillDataFlowOption({ disabled }: BackfillDataflowOptionProps) {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();

    const [collectionResetEnabled, setCollectionResetEnabled] = useBindingStore(
        (state) => [
            state.collectionResetEnabled,
            state.setCollectionResetEnabled,
        ]
    );

    if (backfillCount < 1) {
        return null;
    }

    return (
        <Box sx={{ maxWidth: 'fit-content', mt: 3 }}>
            <AlertBox severity="info" short>
                <Typography component="div">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.dataFlowBackfill.message',
                    })}
                </Typography>

                <FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={!Boolean(collectionResetEnabled)}
                                onChange={(_event, checked) =>
                                    setCollectionResetEnabled(!checked)
                                }
                            />
                        }
                        label={`${intl.formatMessage({
                            id: 'workflows.collectionSelector.dataFlowBackfill.input',
                        })}`}
                    />
                </FormControl>
            </AlertBox>
        </Box>
    );
}

export default BackfillDataFlowOption;
