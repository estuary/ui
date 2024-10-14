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
import {
    primaryButtonText,
    primaryColoredBackground_hovered,
} from 'context/Theme';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { hasLength } from 'utils/misc-utils';
import { POSTGRES_INTERVAL_RE } from 'validation';

const DESCRIPTION_ID = 'capture-interval-description';
const INPUT_ID = 'capture-interval-input';
const INPUT_SIZE = 'small';
interface Props {
    readOnly?: boolean;
}

const formatPostgresInterval = (interval: string | null): string => {
    if (typeof interval === 'string' && POSTGRES_INTERVAL_RE.test(interval)) {
        const [hours, minutes, seconds] = interval.split(':').map((segment) => {
            const numericSegment = Number(segment);

            return isFinite(numericSegment) ? numericSegment : 0;
        });

        return hours > 0
            ? `${hours}h`
            : minutes > 0
            ? `${minutes}m`
            : `${seconds}s`;
    }

    return interval ?? '';
};

function CaptureInterval({ readOnly }: Props) {
    const intl = useIntl();
    const label = intl.formatMessage({
        id: 'workflows.interval.input.label',
    });

    const interval = useBindingStore((state) => state.captureInterval);
    const setInterval = useBindingStore((state) => state.setCaptureInterval);

    const [input, setInput] = useState(interval);
    const [unit, setUnit] = useState(
        formatPostgresInterval(interval).at(-1) ?? ''
    );

    if (typeof input !== 'string') {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography variant="formSectionHeader">
                <FormattedMessage id="workflows.interval.header" />
            </Typography>

            <Typography style={{ marginBottom: 16 }}>
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
                    endAdornment={
                        <InputAdornment
                            position="end"
                            style={{ marginRight: 1 }}
                        >
                            <Select
                                disabled={readOnly}
                                disableUnderline
                                error={false}
                                onChange={(event) => {
                                    // TODO: (capture-interval): Unset interval values above the selected unit if the input
                                    //   is formatted as an interval. Otherwise, apply the input value to the interval and unset all
                                    //   other interval segments.
                                    console.log(
                                        'select change',
                                        event.target.value
                                    );

                                    setUnit(event.target.value);
                                }}
                                required
                                size={INPUT_SIZE}
                                sx={{
                                    'backgroundColor': (theme) =>
                                        theme.palette.primary.main,
                                    'borderBottomRightRadius': 5,
                                    'borderTopRightRadius': 5,
                                    'color': (theme) =>
                                        primaryButtonText[theme.palette.mode],
                                    'maxWidth': 100,
                                    'minWidth': 100,
                                    '&.Mui-focused,&:hover': {
                                        backgroundColor: (theme) =>
                                            primaryColoredBackground_hovered[
                                                theme.palette.mode
                                            ],
                                    },
                                    '& .MuiFilledInput-input': {
                                        pb: '7px',
                                        pt: '8px',
                                    },
                                    '& .MuiSelect-iconFilled': {
                                        color: (theme) =>
                                            primaryButtonText[
                                                theme.palette.mode
                                            ],
                                    },
                                }}
                                value={unit}
                                variant="filled"
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
                    error={!POSTGRES_INTERVAL_RE.test(input)}
                    id={INPUT_ID}
                    label={label}
                    onChange={(event) => {
                        console.log('change', event.target.value);
                        const value = event.target.value.trim();

                        setInput(value);

                        if (
                            !hasLength(value) ||
                            POSTGRES_INTERVAL_RE.test(value)
                        ) {
                            setInterval(value);
                        }
                    }}
                    size={INPUT_SIZE}
                    sx={{
                        borderRadius: 3,
                        pr: 0,
                    }}
                    value={input}
                />

                <FormHelperText
                    id={DESCRIPTION_ID}
                    error={!POSTGRES_INTERVAL_RE.test(input)}
                    style={{ marginLeft: 0 }}
                >
                    {intl.formatMessage({
                        id: 'captureInterval.description.format',
                    })}
                </FormHelperText>
            </FormControl>
        </Stack>
    );
}

export default CaptureInterval;
