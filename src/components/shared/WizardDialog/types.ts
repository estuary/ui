import type { ReactNode } from 'react';

export interface WizardStep {
    /** Unique identifier for the step */
    id: string;
    /** Display label for the step (shown in stepper) */
    label: ReactNode;
    /** The component to render for this step */
    component: ReactNode;
    /** Whether the back button should be shown (default: true for steps > 0) */
    canGoBack?: boolean;
    /** Custom label for the next/submit button */
    nextLabel?: ReactNode;
    /** Whether this step can be skipped */
    optional?: boolean;
}

export interface WizardContextValue {
    /** Current step index (0-based) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Array of step configurations */
    steps: WizardStep[];
    /** Whether we're on the first step */
    isFirstStep: boolean;
    /** Whether we're on the last step */
    isLastStep: boolean;
    /** Navigate to the next step (validates current step first) */
    goToNext: () => Promise<boolean>;
    /** Navigate to the previous step */
    goToPrevious: () => void;
    /** Navigate to a specific step by index */
    goToStep: (index: number) => void;
    /** Whether navigation is currently in progress */
    isNavigating: boolean;
}

export interface WizardDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog should close */
    onClose: () => void;
    /** Array of step configurations */
    steps: WizardStep[];
    /** Callback when wizard is completed (last step next button clicked) */
    onComplete?: () => void | Promise<void>;
    /** Validation function called before navigating to next step. Return true to proceed, false to block. */
    validateStep?: (stepIndex: number) => boolean | Promise<boolean>;
    /** Dialog title */
    title: ReactNode;
    /** Accessible ID for the dialog title */
    titleId?: string;
    /** Max width of the dialog */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Initial step index (default: 0) */
    initialStep?: number;
}
