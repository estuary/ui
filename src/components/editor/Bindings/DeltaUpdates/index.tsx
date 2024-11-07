import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';
import { BindingPropertyEditorProps } from '../types';

// https://docs.estuary.dev/concepts/materialization/#delta-updates
function DeltaUpdates({ bindingIndex = -1 }: BindingPropertyEditorProps) {
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
                            // value={autoDiscover}
                            // checked={autoDiscover}
                            // disabled={readOnly ?? formActive}
                            onChange={(event, checked) => {
                                console.log('clicked', [checked, event]);
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
