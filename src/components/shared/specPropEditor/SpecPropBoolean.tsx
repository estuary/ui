import type { SpecPropInputProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useMemo, useState } from 'react';

import {
    Button,
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { stringifyJSON } from 'src/services/stringify';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export default function SpecPropBoolean({
    currentSetting,
    inputLabelId,
    invalidSettingsMessageId,
    scope,
    setErrorExists,
    updateDraftedSetting,
}: SpecPropInputProps) {
    const intl = useIntl();

    const [localValue, setLocalValue] = useState(false);
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
            setLocalValue(false);
            setInvalidSetting(false);
            return;
        }

        // We have a setting but could not find a matching option
        //  Set a flag to show an error and empty out the input
        if (selection === null) {
            setLocalValue(false);
            setInvalidSetting(true);
            return;
        }

        setLocalValue(selection);
        setInvalidSetting(false);
    }, [currentSetting, selection]);

    useEffect(() => {
        setErrorExists(invalidSetting, scope);
    }, [invalidSetting, scope, setErrorExists]);

    return (
        <Stack spacing={1}>
            {invalidSetting ? (
                <AlertBox
                    severity="error"
                    short
                    sx={{ maxWidth: 'fit-content' }}
                >
                    <Typography>
                        {intl.formatMessage(
                            {
                                id: invalidSettingsMessageId,
                            },
                            {
                                currentSetting:
                                    typeof currentSetting === 'string'
                                        ? currentSetting
                                        : stringifyJSON(currentSetting),
                            }
                        )}
                    </Typography>

                    <Button
                        disabled={formActive}
                        size="small"
                        sx={{ maxWidth: 'fit-content' }}
                        variant="text"
                        onClick={() => updateDraftedSetting()}
                    >
                        {intl.formatMessage({
                            id: 'specPropEditor.error.cta',
                        })}
                    </Button>
                </AlertBox>
            ) : null}

            <Stack spacing={2} sx={{ maxWidth: 'fit-content' }}>
                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={Boolean(localValue)}
                                checked={Boolean(localValue)}
                                disabled={formActive}
                                onChange={(event, checked) => {
                                    setLocalValue(checked);
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
