import type { ReactNode } from 'react';

import { DialogProps } from '@mui/material';

export interface WizardStep {
    /** The component to render for this step */
    component: ReactNode;
    /** Title for the dialog when on this step */
    title?: ReactNode;
    /** Custom label for the next/submit button */
    nextLabel?: ReactNode;
    /** Function to check if the next/save button should be enabled for this step */
    canAdvance?: () => boolean;
    /** Callback when user attempts to proceed from this step. Return true to proceed, false to block. */
    onAdvance?: () => Promise<boolean>;
}

export interface WizardContextType {
    /** Current step index (0-based) */
    currentStep: number;
    /** Array of step configurations */
    steps: WizardStep[];
    /** Whether we're on the first step */
    isFirstStep: boolean;
    /** Whether we're on the last step */
    isLastStep: boolean;
    /** Navigate to the next step (validates current step first) */
    advance: () => Promise<boolean>;
    /** Navigate to the previous step */
    retreat: () => void;
    /** Whether navigation is currently in progress - disables next button, shows spinner */
    isNavigating: boolean;
    /** Error message to display */
    error: string | null;
}

export interface WizardDialogProps {
    /** Whether the dialog is open */
    open: DialogProps['open'];
    /** Whether to show action buttons (Back/Next/Save) */
    showActions?: boolean;
    /** Array of step configurations */
    steps: WizardStep[];
    /** Callback when dialog should close */
    onClose: () => void;
    /** Callback when wizard is completed (last step next button clicked) */
    onComplete?: () => void | Promise<void>;
    /** Default dialog title (used when step doesn't define its own title) */
    title?: ReactNode;
    /** Max width of the dialog */
    maxWidth?: DialogProps['maxWidth'];
}
