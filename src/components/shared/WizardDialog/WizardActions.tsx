import { Button, DialogActions } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useWizard } from 'src/components/shared/WizardDialog/context';

function WizardActions() {
    const {
        isFirstStep,
        isLastStep,
        goToNext,
        goToPrevious,
        isNavigating,
        steps,
        currentStep,
        canProceedFn,
    } = useWizard();

    const currentStepConfig = steps[currentStep];
    const showBack = !isFirstStep && currentStepConfig?.canGoBack !== false;
    const canProceed = canProceedFn ? canProceedFn(currentStep) : true;

    return (
        <DialogActions sx={{ p: 4, pt: 2 }}>
            {showBack ? (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={goToPrevious}
                    disabled={isNavigating}
                >
                    <FormattedMessage id="cta.back" />
                </Button>
            ) : null}

            <Button
                variant="contained"
                size="small"
                onClick={goToNext}
                disabled={isNavigating || !canProceed}
            >
                {currentStepConfig?.nextLabel ?? (
                    isLastStep ? (
                        <FormattedMessage id="cta.save" />
                    ) : (
                        <FormattedMessage id="cta.next" />
                    )
                )}
            </Button>
        </DialogActions>
    );
}

export default WizardActions;
