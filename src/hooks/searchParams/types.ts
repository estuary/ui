import type {
    PublicationSpecsExt_PubIds,
    PublicationSpecsExt_Spec,
} from 'src/api/publicationSpecsExt';
import type {
    usePublicationSpecsExt_DiffViewer,
    usePublicationSpecsExt_History,
} from 'src/hooks/usePublicationSpecsExt';

export type UseHistoryDiffFindFunction = (
    publication: PublicationSpecsExt_Spec | PublicationSpecsExt_PubIds
) => boolean;

export interface UseHistoryDiffFindResponse {
    catalogName: string | undefined;
    originalPubId: string | null;
    modifiedPubId: string | null;

    pubSpecs: ReturnType<typeof usePublicationSpecsExt_DiffViewer>;
    pubHistory: ReturnType<typeof usePublicationSpecsExt_History>;

    findModifiedPublication: UseHistoryDiffFindFunction;
    findOriginalPublication: UseHistoryDiffFindFunction;
    updateSelections: (settings: {
        originalPubId: string | null;
        modifiedPubId: string | null;
    }) => void;
}
