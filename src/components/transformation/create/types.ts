import type { ButtonProps } from '@mui/material';

export type DraftCreationCallback = (
    draftId: string | undefined | null
) => void;

export interface TransformationCreateProps {
    draftCreationCallback: DraftCreationCallback;
    closeDialog: () => void;
}

export interface DraftIdGeneratorButtonProps {
    buttonVariant?: ButtonProps['variant'];
    draftCreationCallback?: DraftCreationCallback;
    entityNameError?: string | null;
    sourceCollectionSet?: Set<string>;
}
