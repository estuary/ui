import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { BindingPropertyEditorProps } from '../types';

function SchemaMode({ bindingIndex = -1 }: BindingPropertyEditorProps) {
    if (bindingIndex > -1) {
        return null;
    }

    return (
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
                label="Default schema from source name"
            />
        </FormControl>
    );
}

export default SchemaMode;
