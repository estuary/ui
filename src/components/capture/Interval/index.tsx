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
import useCaptureInterval from 'hooks/captureInterval/useCaptureInterval';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { hasLength } from 'utils/misc-utils';
import { NUMERIC_RE, POSTGRES_INTERVAL_RE } from 'validation';

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

    const { applyCaptureInterval, updateStoredInterval } = useCaptureInterval();

    // Binding Store
    const interval = useBindingStore((state) => state.captureInterval);

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    const [saving, setSaving] = useState(false);
    const [unit, setUnit] = useState(interval?.at(-1) ?? '');
    const [input, setInput] = useState(
        interval?.substring(0, interval.length - 1)
    );

    const loading = formActive || formStatus === FormStatus.TESTING_BACKGROUND;

    const errorsExist = Boolean(
        input &&
            hasLength(input) &&
            !NUMERIC_RE.test(input) &&
            !POSTGRES_INTERVAL_RE.test(input)
    );

    // TODO (capture-interval): Consider whether capture interval changes should
    //   place the form in an active state while the server patch is underway.
    useEffect(() => {
        if (!errorsExist && !saving) {
            setSaving(true);

            applyCaptureInterval()
                .then(
                    () => {},
                    (error) => {
                        if (error) {
                            setFormState({
                                status: FormStatus.FAILED,
                                error: {
                                    title: 'captureInterval.error.updateFailed',
                                    error,
                                },
                            });
                        }
                    }
                )
                .finally(() => {
                    setSaving(false);
                });
        }
    }, [
        applyCaptureInterval,
        errorsExist,
        interval,
        saving,
        setFormState,
        setSaving,
    ]);

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
                disabled={readOnly ?? loading}
                error={errorsExist}
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
                    disabled={readOnly ?? loading}
                    focused
                    htmlFor={INPUT_ID}
                    variant="outlined"
                >
                    {label}
                </InputLabel>

                <OutlinedInput
                    aria-describedby={DESCRIPTION_ID}
                    disabled={readOnly ?? loading}
                    endAdornment={
                        <InputAdornment
                            position="end"
                            style={{ marginRight: 1 }}
                        >
                            <Select
                                disabled={readOnly ?? loading}
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

                                    updateStoredInterval(
                                        input,
                                        event.target.value
                                    );
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
                    error={errorsExist}
                    id={INPUT_ID}
                    label={label}
                    onChange={(event) => {
                        console.log('change', event.target.value);
                        const value = event.target.value.trim();

                        setInput(value);
                        updateStoredInterval(value, unit, setUnit);
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
                    error={errorsExist}
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
