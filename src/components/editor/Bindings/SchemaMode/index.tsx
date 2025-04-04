import { FormControl, FormControlLabel, Switch } from '@mui/material';

import { useIntl } from 'react-intl';

import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

function SchemaMode() {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

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
                        // Need to make sure undefined isn't passed here or else it thinks it is controlled
                        value={targetSchema ?? 'leaveEmpty'}
                        checked={targetSchema === 'fromSourceName'}
                        disabled={formActive}
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
