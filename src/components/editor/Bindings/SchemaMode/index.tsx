import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { BindingPropertyEditorProps } from '../types';

function SchemaMode({ bindingIndex = -1 }: BindingPropertyEditorProps) {
    const [targetSchema, setTargetSchema] = useSourceCaptureStore((state) => [
        state.targetSchema,
        state.setTargetSchema,
    ]);

    if (bindingIndex > -1) {
        return null;
    }

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
                            console.log('clicked', [checked, event]);
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
