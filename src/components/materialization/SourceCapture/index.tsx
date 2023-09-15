import {
    Collapse,
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

const INPUT_ID = 'source-capture-input';

function SourceCapture() {
    const formActive = useFormStateStore_isActive();

    const [sourceCaptureEnabled, setSourceCaptureEnabled] = useState(false);

    return (
        <Stack spacing={1} sx={{ mt: 2, mb: 3 }}>
            <Typography sx={{ fontWeight: 500 }}>
                <FormattedMessage id="workflows.sourceCapture.header" />
            </Typography>

            <FormControl sx={{ pl: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            value={sourceCaptureEnabled}
                            checked={sourceCaptureEnabled}
                            disabled={formActive}
                            onChange={(event, checked) => {
                                event.preventDefault();
                                event.stopPropagation();

                                setSourceCaptureEnabled(checked);
                            }}
                        />
                    }
                    label={
                        <FormattedMessage id="workflows.sourceCapture.optin.label" />
                    }
                />
            </FormControl>

            <Collapse in={sourceCaptureEnabled}>
                <TextField
                    disabled={formActive}
                    helperText={
                        <FormattedMessage id="workflows.sourceCapture.input.description" />
                    }
                    id={INPUT_ID}
                    label={
                        <FormattedMessage id="workflows.sourceCapture.input.label" />
                    }
                    size="small"
                    variant="standard"
                />
            </Collapse>
        </Stack>
    );
}

export default SourceCapture;
