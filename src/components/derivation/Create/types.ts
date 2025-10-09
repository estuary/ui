export interface ConfigHeaderProps {
    entityNameError: string | null;
}

export interface InstructionsProps {
    draftId: string | null;
}

export interface TechnicalEmphasisProps {
    intlKey: string;
    enableBackground?: boolean;
}

export interface InstructionStepProps {
    labelKey: string;
    contentSections: Array<'code' | 'details' | 'learnMore'>;

    codeValues?: Record<string, any>;
    detailsHaveLink?: boolean;
    detailsValues?: Record<string, React.ReactNode>;
    labelValues?: Record<string, React.ReactNode>;
}
