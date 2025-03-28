import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

// https://docs.estuary.dev/concepts/materialization/#delta-updates
function DeltaUpdates() {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const [deltaUpdates, setDeltaUpdates] = useSourceCaptureStore((state) => [
        state.deltaUpdates,
        state.setDeltaUpdates,
    ]);

    return (
        <Stack spacing={2} sx={{ maxWidth: 'fit-content' }}>
            <FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            value={Boolean(deltaUpdates)}
                            checked={Boolean(deltaUpdates)}
                            disabled={formActive}
                            onChange={(event, checked) => {
                                setDeltaUpdates(checked);
                            }}
                        />
                    }
                    label={intl.formatMessage({
                        id: 'workflows.sourceCapture.optionalSettings.deltaUpdates.control',
                    })}
                />
            </FormControl>
        </Stack>
    );
}

export default DeltaUpdates;
