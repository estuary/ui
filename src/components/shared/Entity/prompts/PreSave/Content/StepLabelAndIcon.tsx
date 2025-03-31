import { StepLabel, useTheme } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import CustomStepIcon from 'src/components/shared/Entity/prompts/PreSave/Content/CustomStepIcon';
import SkippedStepIcon from 'src/components/shared/Entity/prompts/PreSave/Content/SkippedStepIcon';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';

function StepLabelAndIcon() {
    const intl = useIntl();
    const theme = useTheme();

    const stepIndex = useLoopIndex();
    const [error, optionalLabel, progress, stepLabelMessageId] =
        usePreSavePromptStore(
            useShallow((state) => {
                const currentStep = state.steps[stepIndex];
                const currentState = currentStep.state;

                return [
                    currentState.error,
                    currentState.optionalLabel,
                    currentState.progress,
                    currentStep.stepLabelMessageId,
                ];
            })
        );

    const stepSkipped = progress === ProgressStates.SKIPPED;

    return (
        <StepLabel
            error={Boolean(error)}
            optional={
                optionalLabel
                    ? optionalLabel
                    : stepSkipped
                      ? intl.formatMessage({
                            id: 'common.skipped',
                        })
                      : undefined
            }
            sx={{
                '& .MuiStepLabel-label': {
                    color: theme.palette.text.primary,
                },
            }}
            StepIconComponent={
                stepSkipped
                    ? SkippedStepIcon
                    : progress === ProgressStates.IDLE
                      ? undefined
                      : CustomStepIcon
            }
        >
            {intl.formatMessage({
                id: stepLabelMessageId,
            })}
        </StepLabel>
    );
}

export default StepLabelAndIcon;
