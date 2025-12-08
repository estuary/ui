import type { TypographyProps } from '@mui/material';

export interface ConfigHeaderProps {
    entityNameError: string | null;
}

export interface InstructionsProps {
    draftId: string | null;
}

export interface TechnicalEmphasisProps extends TypographyProps {
    enableBackground?: boolean;
}

export interface InstructionStepProps {
    labelKey: string;
    contentSections: Array<'code' | 'details' | 'linked'>;

    codeValues?: Record<string, any>;
    detailsValues?: Record<string, React.ReactNode>;
    labelValues?: Record<string, React.ReactNode>;
}
