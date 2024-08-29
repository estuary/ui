import {
    Box,
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { useIntl } from 'react-intl';
import { useBinding_backfilledBindings } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

function BackfillDataflowOption() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();
    const backfilledBindings = useBinding_backfilledBindings();

    const [backfillDataflow, setBackfillDataflow] = useBindingStore((state) => [
        state.backfillDataflow,
        state.setBackfillDataflow,
    ]);

    return (
        <Box sx={{ mt: 3 }}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="formSectionHeader">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.dataflowBackfill.header',
                    })}
                </Typography>

                <Typography component="div">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.dataflowBackfill.message',
                    })}
                </Typography>
            </Stack>

            <FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            value={backfillDataflow}
                            checked={backfillDataflow}
                            disabled={Boolean(
                                formActive || backfilledBindings.length < 1
                            )}
                            onChange={(event, checked) => {
                                event.preventDefault();
                                event.stopPropagation();

                                setBackfillDataflow(checked);
                            }}
                        />
                    }
                    label={intl.formatMessage({
                        id: 'workflows.collectionSelector.dataflowBackfill.option',
                    })}
                />
            </FormControl>
        </Box>
    );
}

export default BackfillDataflowOption;
