import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { BindingPropertyEditorProps } from '../types';

// https://docs.estuary.dev/concepts/materialization/#delta-updates
function DeltaUpdates({ bindingIndex = -1 }: BindingPropertyEditorProps) {
    const [deltaUpdates, setDeltaUpdates] = useSourceCaptureStore((state) => [
        state.deltaUpdates,
        state.setDeltaUpdates,
    ]);

    if (bindingIndex > -1) {
        return null;
    }

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
                                console.log('clicked', [checked, event]);
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
