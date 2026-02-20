import type {
    WizardContextType,
    WizardDialogProps,
} from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useState } from 'react';

import { Collapse, Dialog } from '@mui/material';

import { useIntl } from 'react-intl';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { WizardContext } from 'src/components/shared/WizardDialog/context';
import { WizardActions } from 'src/components/shared/WizardDialog/WizardActions';
import { WizardContent } from 'src/components/shared/WizardDialog/WizardContent';

const TITLE_ID = 'wizard-dialog-title';

export function WizardDialog({
    open,
    onClose,
    steps,
    onComplete,
    title,
    maxWidth = 'sm',
    showActions = true,
}: WizardDialogProps) {
    const intl = useIntl();
    const initialStep = 0;

    const [currentStep, setCurrentStep] = useState(initialStep);
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state after dialog close animation completes
    const onExited = useCallback(() => {
        setCurrentStep(initialStep);
        setError(null);
    }, [initialStep]);

    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    const advance = useCallback(async (): Promise<boolean> => {
        setError(null);

        const currentStepConfig = steps[currentStep];

        // Run step-specific onAdvance callback if provided
        if (currentStepConfig?.onAdvance) {
            setIsNavigating(true);
            try {
                const proceed = await currentStepConfig.onAdvance();
                if (!proceed) {
                    return false;
                }
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : intl.formatMessage({ id: 'wizardDialog.error.step' })
                );
                return false;
            } finally {
                setIsNavigating(false);
            }
        }

        if (isLastStep) {
            // On last step, call onComplete
            if (onComplete) {
                setIsNavigating(true);
                try {
                    await onComplete();
                } catch (error) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : intl.formatMessage({ id: 'wizardDialog.error.completion' })
                    );
                    return false;
                } finally {
                    setIsNavigating(false);
                }
            }
            onClose();
        } else {
            // Move to next step
            setCurrentStep((prev) => prev + 1);
        }

        return true;
    }, [currentStep, intl, isLastStep, onClose, onComplete, steps]);

    const retreat = useCallback(() => {
        if (!isFirstStep) {
            setError(null);
            setCurrentStep((prev) => prev - 1);
        }
    }, [isFirstStep]);

    const contextValue = useMemo(
        () =>
            ({
                currentStep,
                steps,
                isFirstStep,
                isLastStep,
                advance,
                retreat,
                isNavigating,
                error,
            }) satisfies WizardContextType,
        [
            currentStep,
            steps,
            isFirstStep,
            isLastStep,
            advance,
            retreat,
            isNavigating,
            error,
        ]
    );

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
                TransitionProps={{ onExited }}
            >
                <DialogTitleWithClose id={TITLE_ID} onClose={onClose}>
                    {displayTitle}
                </DialogTitleWithClose>
                <WizardContent />
                <Collapse in={showActions}>
                    <WizardActions />
                </Collapse>
            </Dialog>
        </WizardContext.Provider>
    );
}
