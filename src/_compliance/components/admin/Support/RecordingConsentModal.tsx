import { useState } from 'react';

import { Button, Stack, TextField } from '@mui/material';

import { DateTime } from 'luxon';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import DatePickerCTA from 'src/components/shared/pickers/DatePickerCTA';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';

const INPUT_ID = 'EnhancedSupportDatePicker';
function RecordingConsentModal() {
    const { setPrivacySettings } = usePrivacySettings();

    const [localValue, setLocalValue] = useState<any>('');

    const { events, state, buttonRef } = useDatePickerState(
        `date-time-picker-${INPUT_ID}`
    );

    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: 'space-between',
            }}
        >
            <Stack direction="row">
                <TextField
                    id={INPUT_ID}
                    label="Expiration Date"
                    value={localValue}
                    variant="standard"
                    {...events}
                />
                <DatePickerCTA
                    futureOnly
                    maxDate={30}
                    enabled={true}
                    label="Expiration Date"
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
                size="small"
                onClick={() => {
                    console.log('localValue', localValue);

                    // Fetch when it should end (do NOT used begin/end of day as we want to match the hour they enable)
                    const supportEnd = DateTime.fromISO(localValue, {
                        zone: 'utc',
                    }).endOf('day');

                    setPrivacySettings(true, supportEnd);
                }}
            >
                Enable Support
            </Button>
        </Stack>
    );
}

export default RecordingConsentModal;
