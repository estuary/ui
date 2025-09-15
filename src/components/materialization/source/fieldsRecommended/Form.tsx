import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useRef } from 'react';

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

    useEffect(() => {
        if (defaultValue.current) {
            if (currentSetting) {
                setFieldsRecommended(currentSetting);

                defaultValue.current = false;
            }
        }
    }, [currentSetting, setFieldsRecommended]);

    const autoCompleteOptions = [
        { label: '0', val: 0 },
        { label: '1', val: 1 },
        { label: '2', val: 2 },
        { label: intl.formatMessage({ id: 'common.unlimited' }), val: true },
    ];

    return (
        <SpecPropAutoComplete
            currentSetting={currentSetting}
            freeSolo
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
                option: { label: string; val: number | boolean }
            ) => {
                return <li {...renderOptionProps}>{option.label}</li>;
            }}
            scope={scope}
            setErrorExists={(errorExists) => {
                setDeltaUpdatesHasError(errorExists);
            }}
            sx={{
                maxWidth: 700,
            }}
            updateDraftedSetting={updateDraftedSetting}
        />
    );
};

export default FieldsRecommendedForm;
