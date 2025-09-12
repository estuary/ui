import type { AutocompleteRenderInputParams } from '@mui/material';
import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useRef, useState } from 'react';

import { Autocomplete, FormControl, Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import SpecPropAutoComplete from 'src/components/shared/specPropEditor/SpecPropAutoComplete';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

const FieldsRecommendedForm = ({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) => {
    const intl = useIntl();
    const workflow = useEntityWorkflow();

    // If we are editing make sure we store the current value into the store "on load"
    const defaultValue = useRef(workflow === 'materialization_edit');

    const [setDeltaUpdatesHasError, setFieldsRecommended] =
        useSourceCaptureStore((state) => [
            state.setDeltaUpdatesHasError,
            state.setFieldsRecommended,
        ]);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (defaultValue.current) {
            if (currentSetting) {
                setFieldsRecommended(currentSetting);

                defaultValue.current = false;
            }
        }
    }, [currentSetting, setFieldsRecommended]);

    const autoCompleteOptions = [
        0,
        1,
        2,
        intl.formatMessage({ id: 'common.unlimited' }),
    ];

    return (
        <Stack spacing={1}>
            <FormControl fullWidth>
                <Autocomplete
                    // disabled={disabled}
                    disableCloseOnSelect
                    freeSolo
                    handleHomeEndKeys
                    inputValue={inputValue}
                    onChange={(_event, values, reason) => {
                        const creating = reason === 'createOption';

                        if (creating) {
                            updateDraftedSetting(values);
                        }
                    }}
                    onInputChange={(_event, value) => {
                        setInputValue(value);
                    }}
                    options={autoCompleteOptions}
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
                            // error={inputErrorExists}
                            label={intl.formatMessage({
                                id: 'fieldsRecommended.input.label',
                            })}
                            size="small"
                        />
                    )}
                    sx={{ flexGrow: 1 }}
                    value={currentSetting}
                />

                {/* 
            {inputErrorExists ? (
                <FormHelperText error={inputErrorExists}>
                    {intl.formatMessage({
                        id: '',
                    })}
                </FormHelperText>
            ) : null} */}
            </FormControl>

            <SpecPropAutoComplete
                currentSetting={currentSetting}
                freeSolo
                inputLabelId="fieldsRecommended.input.label"
                options={autoCompleteOptions}
                renderOption={(
                    renderOptionProps,
                    option: number | boolean | string
                ) => {
                    return <li {...renderOptionProps}>{option}</li>;
                }}
                updateDraftedSetting={updateDraftedSetting}
                setErrorExists={(errorExists) => {
                    setDeltaUpdatesHasError(errorExists);
                }}
                scope={scope}
                sx={{
                    maxWidth: 700,
                }}
            />
        </Stack>
    );
};

export default FieldsRecommendedForm;
