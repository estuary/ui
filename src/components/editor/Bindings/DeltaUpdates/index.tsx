import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';

// https://docs.estuary.dev/concepts/materialization/#delta-updates
function DeltaUpdates() {
    const intl = useIntl();

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
                            value={deltaUpdates}
                            checked={deltaUpdates}
                            // disabled={readOnly ?? formActive}
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
