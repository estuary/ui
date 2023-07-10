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
import { useNavigate } from 'react-router';
import { CustomEvents } from 'services/logrocket';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useTransformationCreate_catalogName } from 'stores/TransformationCreate/hooks';

function DerivationCreateAlternate() {
    usePageTitle({
        header: authenticatedRoutes.beta.new.title,
        headerLink: 'https://docs.estuary.dev/concepts/derivations/',
    });
    const navigate = useNavigate();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const invalidEditors = useEditorStore_invalidEditors();
    const resetEditorStore = useEditorStore_resetState();

    // Form State Store
    const logToken = useFormStateStore_logToken();
    const publicationError = useFormStateStore_error();

    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();

    const helpers = {
        callFailed: (formState: any) => {
            setFormState({
                status: FormStatus.FAILED,
                exitWhenLogsClose: false,
                ...formState,
            });
        },
        exit: () => {
            resetEditorStore();
            resetFormState();
            navigate(authenticatedRoutes.collections.fullPath);
        },
    };

    const handlers = {
        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },
    };

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
                            disabled={invalidEditors.length > 0}
                            callFailed={helpers.callFailed}
                            taskNames={
                                typeof catalogName === 'string'
                                    ? [catalogName]
                                    : undefined
                            }
                            closeLogs={handlers.closeLogs}
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
