import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';

function SchemaMode() {
    const intl = useIntl();

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
                label={intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.targetSchema.control',
                })}
            />
        </FormControl>
    );
}

export default SchemaMode;
