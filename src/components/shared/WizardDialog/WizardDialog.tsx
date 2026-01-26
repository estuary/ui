import type {
    WizardContextValue,
    WizardDialogProps,
} from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useState } from 'react';

import { Dialog } from '@mui/material';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { WizardContext } from 'src/components/shared/WizardDialog/context';
import WizardActions from 'src/components/shared/WizardDialog/WizardActions';
import WizardContent from 'src/components/shared/WizardDialog/WizardContent';

export function WizardDialog({
    open,
    onClose,
    steps,
    onComplete,
    validateStep,
    canProceed: canProceedFn,
    title,
    titleId = 'wizard-dialog-title',
    maxWidth = 'sm',
    initialStep = 0,
}: WizardDialogProps) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [isNavigating, setIsNavigating] = useState(false);

    // Reset to initial step after dialog close animation completes
    const handleExited = useCallback(() => {
        setCurrentStep(initialStep);
    }, [initialStep]);

    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    const goToNext = useCallback(async (): Promise<boolean> => {
        setIsNavigating(true);

        try {
            // Run custom step validation if provided
            if (validateStep) {
                const stepValid = await validateStep(currentStep);
                if (!stepValid) {
                    return false;
                }
            }

            if (isLastStep) {
                // On last step, call onComplete
                if (onComplete) {
                    await onComplete();
                }
            } else {
                // Move to next step
                setCurrentStep((prev) => prev + 1);
            }

            return true;
        } finally {
            setIsNavigating(false);
        }
    }, [currentStep, isLastStep, onComplete, validateStep]);

    const goToPrevious = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [isFirstStep]);

    const goToStep = useCallback(
        (index: number) => {
            if (index >= 0 && index < totalSteps) {
                setCurrentStep(index);
            }
        },
        [totalSteps]
    );

    const contextValue = useMemo<WizardContextValue>(
        () => ({
            currentStep,
            totalSteps,
            steps,
            isFirstStep,
            isLastStep,
            goToNext,
            goToPrevious,
            goToStep,
            isNavigating,
            canProceedFn,
        }),
        [
            currentStep,
            totalSteps,
            steps,
            isFirstStep,
            isLastStep,
            goToNext,
            goToPrevious,
            goToStep,
            isNavigating,
            canProceedFn,
        ]
    );

    const handleClose = useCallback(() => {
        onClose();
        // Step reset is handled by TransitionProps.onExited
    }, [onClose]);

    // Use step-specific title if defined, otherwise fall back to default title
    const currentStepConfig = steps[currentStep];
    const displayTitle = currentStepConfig?.title ?? title;

    return (
        <WizardContext.Provider value={contextValue}>
            <Dialog
                open={open}
                maxWidth={maxWidth}
                fullWidth
                aria-labelledby={titleId}
                TransitionProps={{ onExited: handleExited }}
            >
                <DialogTitleWithClose id={titleId} onClose={handleClose}>
                    {displayTitle}
                </DialogTitleWithClose>

                <WizardContent />
                <WizardActions />
            </Dialog>
        </WizardContext.Provider>
    );
}
