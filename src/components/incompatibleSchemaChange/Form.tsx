import { useEffect, useMemo, useState } from 'react';

import {
    Autocomplete,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { autoCompleteDefaultProps } from './shared';
import { BaseFormProps } from './types';
import { useIntl } from 'react-intl';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import AlertBox from 'src/components/shared/AlertBox';
import useSupportedOptions from 'src/hooks/OnIncompatibleSchemaChange/useSupportedOptions';
import { stringifyJSON } from 'src/services/stringify';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export default function IncompatibleSchemaChangeForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    const [invalidSetting, setInvalidSetting] = useState(false);

    const setOnIncompatibleSchemaChangeErrorExists = useBindingStore(
        (state) => state.setOnIncompatibleSchemaChangeErrorExists
    );

    const formActive = useFormStateStore_isActive();

    const options = useSupportedOptions();

    const selection = useMemo(() => {
        if (!currentSetting || typeof currentSetting !== 'string') {
            return null;
        }

        return options.find((option) => option.val === currentSetting) ?? null;
    }, [currentSetting, options]);

    useEffect(() => {
        // No setting at all so we're good
        if (!currentSetting) {
            setInputValue('');
            setInvalidSetting(false);
            return;
        }

        // We have a setting but could not find a matching option
        //  Set a flag to show an error and empty out the input
        if (!selection) {
            setInputValue('');
            setInvalidSetting(true);
            return;
        }

        setInputValue(selection.label);
        setInvalidSetting(false);
    }, [currentSetting, selection]);

    useEffect(() => {
        setOnIncompatibleSchemaChangeErrorExists(invalidSetting, scope);
    }, [invalidSetting, scope, setOnIncompatibleSchemaChangeErrorExists]);

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
                                id: 'incompatibleSchemaChange.error.message',
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
                            id: 'incompatibleSchemaChange.error.cta',
                        })}
                    </Button>
                </AlertBox>
            ) : null}

            <Autocomplete
                {...autoCompleteDefaultProps}
                disabled={formActive}
                getOptionLabel={(option) => option.label}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    // We force an undefined some times when we need to clear out the option
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (!optionValue) {
                        return false;
                    }

                    return (
                        option.val ===
                        (typeof optionValue === 'string'
                            ? optionValue
                            : optionValue.val)
                    );
                }}
                onChange={(_state, newVal) => updateDraftedSetting(newVal)}
                onInputChange={(event, newInputValue) => {
                    // Set the input value component state only when an option is clicked
                    // to avoid clashing with the effect which also updates this state.
                    if (Boolean(event)) {
                        setInputValue(newInputValue);
                    }
                }}
                options={options}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={formActive}
                            error={invalidSetting}
                            helperText={
                                invalidSetting
                                    ? intl.formatMessage(
                                          {
                                              id: 'incompatibleSchemaChange.error.message',
                                          },
                                          {
                                              currentSetting:
                                                  typeof currentSetting ===
                                                  'string'
                                                      ? currentSetting
                                                      : JSON.stringify(
                                                            currentSetting
                                                        ),
                                          }
                                      )
                                    : undefined
                            }
                            label={intl.formatMessage({
                                id: 'incompatibleSchemaChange.input.label',
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                }}
                sx={{
                    minWidth: 'fit-content',
                    maxWidth: '50%',
                }}
                value={selection}
            />
        </Stack>
    );
}
