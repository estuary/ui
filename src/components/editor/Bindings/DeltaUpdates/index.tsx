import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';

// https://docs.estuary.dev/concepts/materialization/#delta-updates
function DeltaUpdates() {
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
                    label="Default delta updates"
                />
            </FormControl>
        </Stack>
    );
}

export default DeltaUpdates;
