import type { SpecPropInputProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useMemo, useState } from 'react';

import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material';

import { useIntl } from 'react-intl';

import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export default function SpecPropBoolean({
    currentSetting,
    inputLabelId,
    invalidSettingsMessageId = 'specPropUpdater.error.message',
    scope,
    setErrorExists,
    updateDraftedSetting,
}: SpecPropInputProps) {
    const intl = useIntl();

    const [invalidSetting, setInvalidSetting] = useState(false);

    const formActive = useFormStateStore_isActive();

    const selection = useMemo(() => {
        if (!currentSetting || typeof currentSetting !== 'boolean') {
            return null;
        }

        return currentSetting;
    }, [currentSetting]);

    useEffect(() => {
        // No setting at all so we're good
        if (!currentSetting) {
            setInvalidSetting(false);
            return;
        }

        // We have a setting but could not find a matching option
        //  Set a flag to show an error and empty out the input
        if (selection === null) {
            setInvalidSetting(true);
            return;
        }

        setInvalidSetting(false);
    }, [currentSetting, selection]);

    useEffect(() => {
        setErrorExists(invalidSetting, scope);
    }, [invalidSetting, scope, setErrorExists]);

    return (
        <Stack spacing={1}>
            {invalidSetting ? (
                <SpecPropInvalidSetting
                    currentSetting={currentSetting}
                    invalidSettingsMessageId={invalidSettingsMessageId}
                    updateDraftedSetting={updateDraftedSetting}
                />
            ) : null}

            <Stack spacing={2} sx={{ maxWidth: 'fit-content' }}>
                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={Boolean(currentSetting)}
                                checked={Boolean(currentSetting)}
                                disabled={formActive}
                                onChange={(event, checked) => {
                                    updateDraftedSetting(checked);
                                }}
                            />
                        }
                        label={intl.formatMessage({
                            id: inputLabelId,
                        })}
                    />
                </FormControl>
            </Stack>
        </Stack>
    );
}
