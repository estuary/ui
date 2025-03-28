import {
    Box,
    FormControl,
    FormControlLabel,
    Switch,
    Typography,
} from '@mui/material';
import AlertBox from 'src/components/shared/AlertBox';
import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { BackfillDataflowOptionProps } from './types';

function BackfillDataFlowOption({ disabled }: BackfillDataflowOptionProps) {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const defaulted = useRef(false);

    const [backfillDataflow, setBackfillDataflow] = useBindingStore((state) => [
        state.backfillDataFlow,
        state.setBackfillDataFlow,
    ]);

    const backfillCount = useBinding_backfilledBindings_count();

    useEffect(() => {
        // When this option is viewed default the choice
        if (!defaulted.current && backfillCount > 0) {
            defaulted.current = true;
            setBackfillDataflow(true);
        }

        return () => {
            // When closing reset it
            if (defaulted.current) {
                setBackfillDataflow(false);
                defaulted.current = false;
            }
        };
    }, [backfillCount, setBackfillDataflow]);

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
                <Box sx={{ pl: 1, mt: 1 }}>
                    <Typography component="div">
                        {intl.formatMessage({
                            id: 'workflows.collectionSelector.dataFlowBackfill.message',
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
                                id: 'workflows.collectionSelector.dataFlowBackfill.option',
                            })}
                        />
                    </FormControl>
                </Box>
            </AlertBox>
        </Box>
    );
}

export default BackfillDataFlowOption;
