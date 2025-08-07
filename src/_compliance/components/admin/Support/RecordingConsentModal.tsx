import { useState } from 'react';

import { Button, Stack, TextField } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import DatePickerCTA from 'src/components/shared/pickers/DatePickerCTA';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';

const INPUT_ID = 'EnhancedSupportDatePicker';
function RecordingConsentModal() {
    const intl = useIntl();

    const { setPrivacySettings } = usePrivacySettings();

    const [localValue, setLocalValue] = useState<any>('');

    const { events, state, buttonRef } = useDatePickerState(
        `date-time-picker-${INPUT_ID}`
    );

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Stack direction="row">
                <TextField
                    id={INPUT_ID}
                    label={intl.formatMessage({
                        id: 'supportConsent.enhancedSupport.date.label',
                    })}
                    value={localValue}
                    variant="standard"
                    {...events}
                />
                <DatePickerCTA
                    disablePast
                    // TODO - need to decide if we allow 29 or 30 days since today will be included
                    maxDays={29}
                    enabled={true}
                    label={intl.formatMessage({
                        id: 'supportConsent.enhancedSupport.date.label',
                    })}
                    buttonRef={buttonRef}
                    state={state}
                    removeOffset
                    value={localValue}
                    onChange={(value) => {
                        setLocalValue(value);
                    }}
                />
            </Stack>
            <Button
                disabled={localValue.length < 1}
                onClick={async () => {
                    // Fetch when it should end (do NOT used begin/end of day as we want to match the hour they enable)
                    const supportEnd = DateTime.fromISO(localValue, {
                        zone: 'utc',
                    }).endOf('day');

                    await setPrivacySettings(true, supportEnd);
                }}
            >
                Enable Support
            </Button>
        </Stack>
    );
}

export default RecordingConsentModal;
