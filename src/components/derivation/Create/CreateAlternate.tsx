import { Box, Collapse } from '@mui/material';

import { useUnmount } from 'react-use';

import { authenticatedRoutes } from 'src/app/routes';
import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_invalidEditors,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
} from 'src/components/editor/Store/hooks';
import CatalogEditor from 'src/components/shared/Entity/CatalogEditor';
import EntityError from 'src/components/shared/Entity/Error';
import EntityToolbar from 'src/components/shared/Entity/Header';
import DerivationConfig from 'src/components/transformation/create/Config';
import PatchDraftButton from 'src/components/transformation/create/PatchDraftButton';
import DerivationSchema from 'src/components/transformation/create/Schema';
import usePageTitle from 'src/hooks/usePageTitle';
import { CustomEvents } from 'src/services/types';
import {
    useFormStateStore_error,
    useFormStateStore_logToken,
    useFormStateStore_resetState,
} from 'src/stores/FormState/hooks';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_emptySQLExists,
    useTransformationCreate_resetState,
    useTransformationCreate_schemaUnedited,
} from 'src/stores/TransformationCreate/hooks';

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
                    SecondaryButtonComponent={<>Previously Linked To GitPod</>}
                    primaryButtonProps={{
                        disabled:
                            emptySQLExists ||
                            schemaUnedited ||
                            invalidEditors.length > 0,
                        logEvent: CustomEvents.COLLECTION_CREATE,
                    }}
                    secondaryButtonProps={{
                        buttonVariant: 'outlined',
                    }}
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
