import { Collapse, Stack } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityError from 'components/shared/Entity/Error';
import EntityToolbar from 'components/shared/Entity/Header';
import DerivationCatalog from 'components/transformation/create/Catalog';
import GitPodButton from 'components/transformation/create/GitPodButton';
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
    // Draft Editor Store
    const draftId = useEditorStore_id();

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
            resetFormState();
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
        <Stack spacing={3}>
            <EntityToolbar
                GenerateButton={null}
                TestButton={<GitPodButton buttonVariant="outlined" />}
                SaveButton={
                    <EntitySaveButton
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

            <Collapse in={publicationError !== null} unmountOnExit>
                {publicationError ? (
                    <EntityError
                        title={publicationError.title}
                        error={publicationError.error}
                        logToken={logToken}
                        draftId={draftId}
                    />
                ) : null}
            </Collapse>

            <DerivationCatalog />
        </Stack>
    );
}

export default DerivationCreateAlternate;
