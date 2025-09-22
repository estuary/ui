import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useIntl } from 'react-intl';

import SpecPropAutoComplete from 'src/components/shared/specPropEditor/SpecPropAutoComplete';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { toBoolean, toNumber } from 'src/utils/misc-utils';

const FieldsRecommendedForm = ({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) => {
    const intl = useIntl();
    const workflow = useEntityWorkflow();

    // If we are editing make sure we store the current value into the store "on load"
    const defaultValue = useRef(workflow === 'materialization_edit');

    const baseOptions: { label: string; val: boolean | number | string }[] =
        useMemo(
            () => [
                { label: '0', val: 0 },
                { label: '1', val: 1 },
                { label: '2', val: 2 },
                {
                    label: intl.formatMessage({ id: 'common.unlimited' }),
                    val: true,
                },
            ],
            [intl]
        );

    const [setFieldsRecommendedErrorExists, setFieldsRecommended] =
        useSourceCaptureStore((state) => [
            state.setFieldsRecommendedErrorExists,
            state.setFieldsRecommended,
        ]);

    const [autoCompleteOptions, setAutoCompleteOptions] =
        useState<{ label: string; val: boolean | number | string }[]>(
            baseOptions
        );

    useEffect(() => {
        if (defaultValue.current) {
            if (currentSetting) {
                setFieldsRecommended(currentSetting);

                if (
                    baseOptions.every((option) => option.val !== currentSetting)
                ) {
                    setAutoCompleteOptions([
                        ...baseOptions,
                        {
                            label: currentSetting.toString(),
                            val: currentSetting,
                        },
                    ]);
                }

                defaultValue.current = false;
            }
        }
    }, [
        baseOptions,
        currentSetting,
        setAutoCompleteOptions,
        setFieldsRecommended,
    ]);

    return (
        <SpecPropAutoComplete
            currentSetting={currentSetting}
            filterOptions={(_options, params) => {
                const { inputValue } = params;

                const filteredBaseOptions: {
                    label: string;
                    val: boolean | number | string;
                }[] = baseOptions.filter(
                    (option) =>
                        option.label.startsWith(inputValue) ||
                        option.label.toLowerCase().startsWith(inputValue)
                );

                const newOption:
                    | { label: string; val: boolean | number | string }
                    | undefined =
                    filteredBaseOptions.length === 0
                        ? {
                              label: `${inputValue}`,
                              val:
                                  toNumber(inputValue) ??
                                  toBoolean(inputValue) ??
                                  inputValue,
                          }
                        : undefined;

                return newOption ? [newOption] : filteredBaseOptions;
            }}
            freeSolo
            handleChange={(_event, value, reason) => {
                console.log('>>> value', value);
                console.log('>>> reason', reason);

                const valueLabel: string | undefined =
                    typeof value === 'string' ? value : value?.label;

                if (
                    (reason === 'createOption' || reason === 'selectOption') &&
                    !autoCompleteOptions.some((option) =>
                        valueLabel ? option.label === valueLabel : false
                    )
                ) {
                    const newOption =
                        typeof value === 'string'
                            ? {
                                  label: `${value}`,
                                  val:
                                      toNumber(value) ??
                                      toBoolean(value) ??
                                      value,
                              }
                            : value;

                    setAutoCompleteOptions([...autoCompleteOptions, newOption]);
                }
            }}
            inputLabelId="fieldsRecommended.input.label"
            isOptionEqualToValue={(option, targetOption) => {
                const targetValue =
                    typeof targetOption.val === 'object'
                        ? targetOption.val.val
                        : targetOption.val;

                if (option.val === 0 && targetValue === false) {
                    return true;
                }

                return option.val === targetValue;
            }}
            options={autoCompleteOptions}
            renderOption={(
                renderOptionProps,
                option: { label: string; val: number | boolean | string }
            ) => {
                return <li {...renderOptionProps}>{option.label}</li>;
            }}
            scope={scope}
            setErrorExists={(errorExists) => {
                setFieldsRecommendedErrorExists(errorExists);
            }}
            sx={{ maxWidth: 700 }}
            updateDraftedSetting={updateDraftedSetting}
        />
    );
};

export default FieldsRecommendedForm;
