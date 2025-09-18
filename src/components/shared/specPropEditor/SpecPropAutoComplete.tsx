import type { SpecPropAutoCompleteProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useMemo, useState } from 'react';

import { Autocomplete, Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import { autoCompleteDefaultProps } from 'src/components/incompatibleSchemaChange/shared';
import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';
import { stringifyJSON } from 'src/services/stringify';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

const DigitRegEx = new RegExp(/\d/);

export default function SpecPropAutoComplete({
    currentSetting,
    filterOptions,
    freeSolo,
    inputLabelId,
    invalidSettingsMessageId = 'specPropUpdater.error.message',
    isOptionEqualToValue,
    options,
    renderOption,
    scope,
    setErrorExists,
    sx,
    updateDraftedSetting,
}: SpecPropAutoCompleteProps) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    const [invalidSetting, setInvalidSetting] = useState(false);

    const formActive = useFormStateStore_isActive();

    const selection = useMemo(() => {
        if (!currentSetting) {
            return null;
        }

        // Use the custom matcher if it was provided - otherwise just do a simple compare
        return (
            options.find((option) =>
                isOptionEqualToValue
                    ? isOptionEqualToValue(option, { val: currentSetting })
                    : option.val === currentSetting
            ) ?? null
        );
    }, [currentSetting, isOptionEqualToValue, options]);

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

        if (freeSolo && selection && !DigitRegEx.test(selection)) {
            setInvalidSetting(true);
        }

        setInputValue(selection.label);
        setInvalidSetting(false);
    }, [currentSetting, freeSolo, selection]);

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

            <Autocomplete
                {...autoCompleteDefaultProps}
                disabled={formActive}
                filterOptions={
                    filterOptions
                        ? (options) => filterOptions(options, inputValue)
                        : undefined
                }
                freeSolo={freeSolo}
                getOptionLabel={(option) => option.label}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    // We force an undefined some times when we need to clear out the option
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (!optionValue) {
                        return false;
                    }

                    // Allow custom function to run
                    if (isOptionEqualToValue) {
                        return isOptionEqualToValue(option, optionValue);
                    }

                    return (
                        option.val ===
                        (typeof optionValue === 'string'
                            ? optionValue
                            : optionValue.val)
                    );
                }}
                onChange={(_event, newVal, reason) => {
                    console.log('>>> value', newVal);
                    console.log('>>> reason', reason);

                    if (
                        reason === 'createOption' ||
                        reason === 'selectOption'
                    ) {
                        options.push({
                            label: newVal,
                            val: Number(newVal),
                        });
                    }

                    if (
                        !freeSolo ||
                        (freeSolo && newVal && !DigitRegEx.test(newVal))
                    ) {
                        updateDraftedSetting(newVal).catch(() => {
                            setInputValue(selection?.label ?? '');
                        });
                    }
                }}
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
                                              id: invalidSettingsMessageId,
                                          },
                                          {
                                              currentSetting:
                                                  typeof currentSetting ===
                                                  'string'
                                                      ? currentSetting
                                                      : stringifyJSON(
                                                            currentSetting
                                                        ),
                                          }
                                      )
                                    : undefined
                            }
                            label={intl.formatMessage({
                                id: inputLabelId,
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={renderOption}
                sx={{
                    minWidth: 'fit-content',
                    maxWidth: '50%',
                    ...(sx ?? {}),
                }}
                value={selection}
            />
        </Stack>
    );
}
