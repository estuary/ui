import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import generateTransformSpec from 'components/transformation/create/generateTransformSpec';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_name,
} from 'stores/TransformationCreate/hooks';

interface Props {
    entityNameError: string | null;
    selectedCollections: Set<string>;
    setSQLEditorOpen: Dispatch<SetStateAction<boolean>>;
}

function InitializeDraftButton({
    entityNameError,
    selectedCollections,
    setSQLEditorOpen: setOpenSQLEditor,
}: Props) {
    // Transformation Create Store
    const language = useTransformationCreate_language();

    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    const validationErrorMessageId = useMemo(() => {
        if (selectedCollections.size < 1) {
            return 'newTransform.errors.collection';
        } else if (!entityName) {
            return 'newTransform.errors.name';
        } else {
            return null;
        }
    }, [entityName, selectedCollections]);

    const formInvalid = useMemo(
        () => Boolean(entityNameError ?? validationErrorMessageId),
        [entityNameError, validationErrorMessageId]
    );

    const initializeTransformation = useCallback(async (): Promise<void> => {
        if (catalogName) {
            const draftsResponse = await createEntityDraft(catalogName);

            if (draftsResponse.error) {
                // Set error state
            } else if (draftsResponse.data && draftsResponse.data.length > 0) {
                const draftId = draftsResponse.data[0].id;

                const spec = generateTransformSpec(
                    language,
                    catalogName,
                    selectedCollections
                );

                const draftSpecResponse = await createDraftSpec(
                    draftsResponse.data[0].id,
                    catalogName,
                    spec,
                    'collection'
                );

                if (draftSpecResponse.error) {
                    // Set error state
                } else {
                    setDraftId(draftId);
                    setPersistedDraftId(draftId);

                    setOpenSQLEditor(true);
                }
            } else {
                // Set error state
            }
        }
    }, [
        setDraftId,
        setOpenSQLEditor,
        setPersistedDraftId,
        catalogName,
        language,
        selectedCollections,
    ]);

    return (
        <LoadingButton
            variant="contained"
            disabled={formInvalid}
            onClick={initializeTransformation}
        >
            <FormattedMessage id={validationErrorMessageId ?? 'cta.next'} />
        </LoadingButton>
    );
}

export default InitializeDraftButton;
