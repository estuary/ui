import { Button, DialogActions } from '@mui/material';

import { useWizard } from 'src/components/shared/WizardDialog/context';

// Renders Back/Next/Save buttons and error text for the current wizard step.
// Button visibility and labels adapt based on step position and per-step config.
export function WizardActions() {
    const {
        isFirstStep,
        isLastStep,
        advance,
        retreat,
        isNavigating,
        steps,
        currentStep,
    } = useWizard();

    const currentStepConfig = steps[currentStep];
    const showBackButton = !isFirstStep;
    const canAdvance = currentStepConfig?.canAdvance?.() ?? true;

    return (
        <DialogActions sx={{ px: 3, py: 2 }}>
            {showBackButton ? (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={retreat}
                    disabled={isNavigating}
                >
                    Back
                </Button>
            ) : null}

            <Button
                variant="contained"
                size="small"
                onClick={advance}
                disabled={!canAdvance}
                loading={isNavigating}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {currentStepConfig?.nextLabel ?? (isLastStep ? 'Save' : 'Next')}
            </Button>
        </DialogActions>
    );
}
