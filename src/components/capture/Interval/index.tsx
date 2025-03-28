import type { AutocompleteRenderInputParams } from '@mui/material';
import type { CaptureIntervalProps } from 'src/components/capture/Interval/types';

import { useMemo, useState } from 'react';

import {
    Autocomplete,
    FormHelperText,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { Duration } from 'luxon';
import { FormattedMessage, useIntl } from 'react-intl';

import useCaptureInterval from 'src/hooks/captureInterval/useCaptureInterval';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { hasLength } from 'src/utils/misc-utils';
import { CAPTURE_INTERVAL_RE } from 'src/validation';

function CaptureInterval({ readOnly }: CaptureIntervalProps) {
    const intl = useIntl();
    const label = intl.formatMessage({
        id: 'captureInterval.input.label',
    });

    const { updateStoredInterval } = useCaptureInterval();

    // Binding Store
    const interval = useBindingStore((state) => state.captureInterval);
    const defaultInterval = useBindingStore(
        (state) => state.defaultCaptureInterval
    );

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();

    const [input, setInput] = useState(interval ?? '');

    const loading = formActive || formStatus === FormStatus.TESTING_BACKGROUND;

    const errorsExist = useMemo(
        () =>
            Boolean(
                input && hasLength(input) && !CAPTURE_INTERVAL_RE.test(input)
            ),
        [input]
    );

    if (typeof input !== 'string' || isEmpty(defaultInterval)) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1} style={{ alignItems: 'center' }}>
                <Typography variant="formSectionHeader">
                    <FormattedMessage id="captureInterval.header" />
                </Typography>

                <Tooltip
                    placement="right-start"
                    title={intl.formatMessage({
                        id: 'captureInterval.tooltip',
                    })}
                >
                    <HelpCircle style={{ fontSize: 11 }} />
                </Tooltip>
            </Stack>

            <Typography>
                <FormattedMessage id="captureInterval.message" />
            </Typography>

            <Autocomplete
                disabled={readOnly ?? loading}
                freeSolo
                onInputChange={(_event, value) => {
                    setInput(value);
                    updateStoredInterval(value);
                }}
                onChange={(_event, value) => {
                    if (typeof value === 'string') {
                        setInput(value);
                        updateStoredInterval(value);
                    }
                }}
                options={[
                    '0s',
                    '30s',
                    '1m',
                    '5m',
                    '15m',
                    '30m',
                    '1h',
                    '2h',
                    '4h',
                ]}
                renderInput={({
                    InputProps,
                    ...params
                }: AutocompleteRenderInputParams) => (
                    <TextField
                        {...params}
                        InputProps={{
                            ...InputProps,
                            sx: { borderRadius: 3 },
                        }}
                        error={errorsExist}
                        label={label}
                        size="small"
                    />
                )}
                sx={{ width: 400 }}
                value={input}
            />

            <FormHelperText style={{ marginLeft: 0 }}>
                {intl.formatMessage(
                    { id: 'captureInterval.input.description' },
                    {
                        value: Duration.fromObject(defaultInterval).toHuman({
                            listStyle: 'long',
                            unitDisplay: 'short',
                        }),
                    }
                )}
            </FormHelperText>

            {errorsExist ? (
                <FormHelperText error={errorsExist} style={{ marginLeft: 0 }}>
                    {intl.formatMessage({
                        id: 'captureInterval.error.intervalFormat',
                    })}
                </FormHelperText>
            ) : null}
        </Stack>
    );
}

export default CaptureInterval;
