import { Box, Collapse } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import DraftSpecEditorHydrator from 'components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_invalidEditors,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import EntityError from 'components/shared/Entity/Error';
import EntityToolbar from 'components/shared/Entity/Header';
import DerivationConfig from 'components/transformation/create/Config';
import GitPodButton from 'components/transformation/create/GitPodButton';
import PatchDraftButton from 'components/transformation/create/PatchDraftButton';
import DerivationSchema from 'components/transformation/create/Schema';
import usePageTitle from 'hooks/usePageTitle';
import { useUnmount } from 'react-use';
import { CustomEvents } from 'services/logrocket';
import {
    useFormStateStore_error,
    useFormStateStore_logToken,
    useFormStateStore_resetState,
} from 'stores/FormState/hooks';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_emptySQLExists,
    useTransformationCreate_resetState,
    useTransformationCreate_schemaUnedited,
} from 'stores/TransformationCreate/hooks';

function DerivationCreateAlternate() {
    usePageTitle({
        header: authenticatedRoutes.beta.new.title,
        headerLink: 'https://docs.estuary.dev/concepts/derivations/',
    });

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const invalidEditors = useEditorStore_invalidEditors();
    const resetEditorStore = useEditorStore_resetState();

    // Form State Store
    const logToken = useFormStateStore_logToken();
    const publicationError = useFormStateStore_error();

    // const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const emptySQLExists = useTransformationCreate_emptySQLExists();
    const schemaUnedited = useTransformationCreate_schemaUnedited();
    const resetTransformationCreateState = useTransformationCreate_resetState();

    useUnmount(() => {
        resetEditorStore();
        resetFormState();
        resetTransformationCreateState();
    });

    return (
        <DraftSpecEditorHydrator
            entityType="collection"
            entityName={catalogName}
        >
            <Box sx={{ mb: 3 }}>
                <EntityToolbar
                    GenerateButton={<PatchDraftButton />}
                    TestButton={<GitPodButton buttonVariant="outlined" />}
                    SaveButton={
                        <EntitySaveButton
                            disabled={
                                emptySQLExists ||
                                schemaUnedited ||
                                invalidEditors.length > 0
                            }
                            taskNames={
                                typeof catalogName === 'string'
                                    ? [catalogName]
                                    : undefined
                            }
                            logEvent={CustomEvents.COLLECTION_CREATE}
                        />
                    }
                />
            </Box>

            <Collapse
                in={publicationError !== null}
                unmountOnExit
                sx={{ mb: 2 }}
            >
                {draftId && publicationError ? (
                    <EntityError
                        title={publicationError.title}
                        error={publicationError.error}
                        logToken={logToken}
                        draftId={draftId}
                    />
                ) : null}
            </Collapse>

            <DerivationConfig />

            <DerivationSchema />

            <CatalogEditor messageId="newTransform.finalReview.instructions" />
        </DraftSpecEditorHydrator>
    );
}

export default DerivationCreateAlternate;
