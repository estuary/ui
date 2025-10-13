import type { LoadingButtonProps } from '@mui/lab';

export type DraftCreationCallback = (
    draftId: string | undefined | null
) => void;

export interface TransformationCreateProps {
    draftCreationCallback: DraftCreationCallback;
    closeDialog: () => void;
}

export interface DraftIdGeneratorButtonProps {
    buttonVariant?: LoadingButtonProps['variant'];
    draftCreationCallback?: DraftCreationCallback;
    entityNameError?: string | null;
    sourceCollectionSet?: Set<string>;
}
