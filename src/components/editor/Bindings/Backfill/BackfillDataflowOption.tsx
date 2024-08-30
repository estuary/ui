import {
    Box,
    FormControl,
    FormControlLabel,
    Switch,
    Typography,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { BackfillDataflowOptionProps } from './types';

function BackfillDataflowOption({ disabled }: BackfillDataflowOptionProps) {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const [backfillDataflow, setBackfillDataflow] = useBindingStore((state) => [
        state.backfillDataflow,
        state.setBackfillDataflow,
    ]);

    const backfillCount = useBinding_backfilledBindings_count();

    if (backfillCount < 1) {
        return null;
    }

    return (
        <Box sx={{ mt: 3, maxWidth: 'fit-content' }}>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'workflows.collectionSelector.dataflowBackfill.header',
                })}
            >
                <Box sx={{ pl: 1, mt: 1 }}>
                    <Typography component="div">
                        {intl.formatMessage({
                            id: 'workflows.collectionSelector.dataflowBackfill.message',
                        })}
                    </Typography>

                    <FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    value={backfillDataflow}
                                    checked={backfillDataflow}
                                    disabled={Boolean(formActive || disabled)}
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
            </AlertBox>
        </Box>
    );
}

export default BackfillDataflowOption;
