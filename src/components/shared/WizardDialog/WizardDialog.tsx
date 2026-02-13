import type {
    WizardContextValue,
    WizardDialogProps,
} from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useState } from 'react';

import { Dialog } from '@mui/material';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { WizardContext } from 'src/components/shared/WizardDialog/context';
import WizardActions from 'src/components/shared/WizardDialog/WizardActions';
import { WizardContent } from 'src/components/shared/WizardDialog/WizardContent';

const TITLE_ID = 'wizard-dialog-title';

export function WizardDialog({
    open,
    onClose,
    steps,
    onComplete,
    title,
    maxWidth = 'sm',
    initialStep = 0,
}: WizardDialogProps) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state after dialog close animation completes
    const handleExited = useCallback(() => {
        setCurrentStep(initialStep);
        setError(null);
    }, [initialStep]);

    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    const goToNext = useCallback(async (): Promise<boolean> => {
        setError(null);

        const currentStepConfig = steps[currentStep];

        // Run step-specific onProceed callback if provided
        if (currentStepConfig?.onProceed) {
            const result = currentStepConfig.onProceed();

            // If onProceed returns a promise, add minimum delay to prevent flashing spinner
            if (result instanceof Promise) {
                setIsNavigating(true);
                try {
                    const minDelay = new Promise((resolve) =>
                        setTimeout(resolve, 1000)
                    );

                    const [proceedResult] = await Promise.all([
                        result.then(
                            (value) => ({ ok: true as const, value }),
                            (err) => ({ ok: false as const, err })
                        ),
                        minDelay,
                    ]);

                    if (!proceedResult.ok) {
                        setError(
                            proceedResult.err instanceof Error
                                ? proceedResult.err.message
                                : 'An error occurred'
                        );
                        return false;
                    }

                    if (!proceedResult.value) {
                        return false;
                    }
                } finally {
                    setIsNavigating(false);
                }
            } else if (!result) {
                return false;
            }
        }

        if (isLastStep) {
            // On last step, call onComplete
            if (onComplete) {
                try {
                    await onComplete();
                } catch (error) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : 'An error occurred during completion'
                    );
                    return false;
                }
            }
        } else {
            // Move to next step
            setCurrentStep((prev) => prev + 1);
        }

        return true;
    }, [currentStep, isLastStep, onComplete, steps]);

    const goToPrevious = useCallback(() => {
        if (!isFirstStep) {
            setError(null);
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
            error,
            setError,
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
            error,
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
                aria-labelledby={TITLE_ID}
                TransitionProps={{ onExited: handleExited }}
            >
                <DialogTitleWithClose id={TITLE_ID} onClose={handleClose}>
                    {displayTitle}
                </DialogTitleWithClose>
                <WizardContent />
                <WizardActions />
            </Dialog>
        </WizardContext.Provider>
    );
}
