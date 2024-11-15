import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';

function SchemaMode() {
    const [targetSchema, setTargetSchema] = useSourceCaptureStore((state) => [
        state.targetSchema,
        state.setTargetSchema,
    ]);

    return (
        <FormControl>
            <FormControlLabel
                control={
                    <Switch
                        size="small"
                        value={targetSchema}
                        checked={targetSchema === 'fromSourceName'}
                        // disabled={readOnly ?? formActive}
                        onChange={(event, checked) => {
                            setTargetSchema(
                                checked ? 'fromSourceName' : 'leaveEmpty'
                            );
                        }}
                    />
                }
                label="Default schema from source name"
            />
        </FormControl>
    );
}

export default SchemaMode;
