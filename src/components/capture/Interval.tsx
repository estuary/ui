import {
    FormControl,
    FormHelperText,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useConnectorStore } from 'stores/Connector/Store';

const DESCRIPTION_ID = 'capture-interval-description';
const INPUT_ID = 'capture-interval-input';
const INPUT_SIZE = 'small';
interface Props {
    readOnly?: boolean;
}

function CaptureInterval({ readOnly }: Props) {
    const intl = useIntl();
    const label = intl.formatMessage({
        id: 'workflows.interval.input.label',
    });

    const captureInterval = useConnectorStore(
        (state) => state.tag?.default_capture_interval
    );

    if (!captureInterval) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography variant="formSectionHeader">
                <FormattedMessage id="workflows.interval.header" />
            </Typography>

            <Typography>
                <FormattedMessage id="workflows.interval.message" />
            </Typography>

            <FormControl
                error={false}
                fullWidth={false}
                size={INPUT_SIZE}
                variant="outlined"
                sx={{
                    '& .MuiFormHelperText-root.Mui-error': {
                        whiteSpace: 'break-spaces',
                    },
                }}
            >
                <InputLabel
                    disabled={readOnly}
                    focused
                    htmlFor={INPUT_ID}
                    variant="outlined"
                >
                    {label}
                </InputLabel>

                <OutlinedInput
                    aria-describedby={DESCRIPTION_ID}
                    disabled={readOnly}
                    error={false}
                    id={INPUT_ID}
                    label={label}
                    size={INPUT_SIZE}
                    sx={{ borderRadius: 3 }}
                    onChange={(event) => {
                        console.log('change', event.target.value);
                    }}
                    endAdornment={
                        <InputAdornment position="start">
                            <Select
                                disabled={readOnly}
                                disableUnderline
                                error={false}
                                required
                                size={INPUT_SIZE}
                                variant="standard"
                                sx={{
                                    'maxWidth': 100,
                                    'minWidth': 100,
                                    '& .MuiSelect-select': {
                                        paddingBottom: 0.2,
                                    },
                                }}
                                onChange={(event) => {
                                    console.log(
                                        'select change',
                                        event.target.value
                                    );
                                }}
                            >
                                <MenuItem value="s" selected>
                                    <FormattedMessage id="workflows.interval.input.seconds" />
                                </MenuItem>

                                <MenuItem value="m">
                                    <FormattedMessage id="workflows.interval.input.minutes" />
                                </MenuItem>

                                <MenuItem value="h">
                                    <FormattedMessage id="workflows.interval.input.hours" />
                                </MenuItem>
                            </Select>
                        </InputAdornment>
                    }
                />
                <FormHelperText
                    id={DESCRIPTION_ID}
                    // error={showErrors ? !description : undefined}
                >
                    errors go here
                </FormHelperText>
            </FormControl>
        </Stack>
    );
}

export default CaptureInterval;
