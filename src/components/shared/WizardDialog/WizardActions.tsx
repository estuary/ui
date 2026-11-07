import { Button, DialogActions } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import { useWizard } from 'src/components/shared/WizardDialog/context';

// Renders Back/Next/Save buttons and error text for the current wizard step.
// Button visibility and labels adapt based on step position and per-step config.
export function WizardActions() {
    const { ref: semanticBackRef } = useSemanticLeaf<HTMLButtonElement>('Back');

    const {
        isFirstStep,
        isLastStep,
        advance,
        retreat,
        isNavigating,
        steps,
        currentStep,
    } = useWizard();

    const { ref: semanticAdvanceRef } = useSemanticLeaf<HTMLButtonElement>(
        isLastStep ? 'Save' : 'Next',
        { step: currentStep }
    );
    const currentStepConfig = steps[currentStep];
    const showBackButton = !isFirstStep;
    const canAdvance = currentStepConfig?.canAdvance?.() ?? true;

    return (
        <DialogActions sx={{ px: 3, py: 2 }}>
            {showBackButton ? (
                <Button
                    ref={semanticBackRef}
                    variant="outlined"
                    size="small"
                    onClick={retreat}
                    disabled={isNavigating}
                >
                    Back
                </Button>
            ) : null}

            <Button
                ref={semanticAdvanceRef}
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
