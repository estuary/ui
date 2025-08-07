import { useState } from 'react';

import { Stack, TextField } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import DatePickerCTA from 'src/components/shared/pickers/DatePickerCTA';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';

const INPUT_ID = 'EnhancedSupportDatePicker';
function RecordingConsentModal() {
    const intl = useIntl();

    const { updatingSetting, setPrivacySettings } = usePrivacySettings();

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
                    maxDays={29} // TODO - need to decide if we allow 29 or 30 days since today will be included
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
            <SafeLoadingButton
                disabled={updatingSetting || localValue.length < 1}
                loading={updatingSetting}
                onClick={async () => {
                    // do not use begin/end of day as we want to match the hour they started
                    const supportEnd = DateTime.fromISO(localValue, {
                        zone: 'utc',
                    }).endOf('day');

                    await setPrivacySettings(true, supportEnd);
                }}
            >
                {intl.formatMessage({
                    id: 'supportConsent.enhancedSupport.enable',
                })}
            </SafeLoadingButton>
        </Stack>
    );
}

export default RecordingConsentModal;
