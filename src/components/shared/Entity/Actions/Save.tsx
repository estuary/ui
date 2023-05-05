import { Button } from '@mui/material';
import {
    deleteDraftSpecsByCatalogName,
    getDraftSpecsBySpecTypeReduced,
} from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
    useEditorStore_setPubId,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    DEFAULT_FILTER,
    jobStatusPoller,
    JOB_STATUS_COLUMNS,
    TABLES,
} from 'services/supabase';
import { useDetailsForm_details_description } from 'stores/DetailsForm/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { useResourceConfig_collections } from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';

interface Props {
    disabled: boolean;
    onFailure: Function;
    logEvent: CustomEvents;
    dryRun?: boolean;
}

const trackEvent = (logEvent: Props['logEvent'], payload: any) => {
    logRocketEvent(logEvent, {
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        dry_run: payload.dry_run ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};

function EntityCreateSave({ disabled, dryRun, onFailure, logEvent }: Props) {
    const intl = useIntl();
    const supabaseClient = useClient();

    const status = dryRun ? FormStatus.TESTING : FormStatus.SAVING;

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setPubId = useEditorStore_setPubId();
    const isSaving = useEditorStore_isSaving();

    // Details Form Store
    const entityDescription = useDetailsForm_details_description();

    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();
    const formActive = useFormStateStore_isActive();

    // Notification Store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const waitForPublishToFinish = (
        logTokenVal: string,
        draftIdVal: string
    ) => {
        updateFormStatus(status);

        jobStatusPoller(
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .select(JOB_STATUS_COLUMNS)
                .match({
                    draft_id: draftIdVal,
                    logs_token: logTokenVal,
                }),
            async (payload: any) => {
                const formStatus = dryRun
                    ? FormStatus.TESTED
                    : FormStatus.SAVED;

                setPubId(payload.id);
                setFormState({
                    status: formStatus,
                    exitWhenLogsClose: !dryRun,
                });

                let description, title;

                if (!dryRun) {
                    description = `${messagePrefix}.createNotification.desc`;
                    title = `${messagePrefix}.createNotification.title`;
                } else {
                    description = `${messagePrefix}.testNotification.desc`;
                    title = `${messagePrefix}.testNotification.title`;
                }

                showNotification({
                    description: intl.formatMessage({
                        id: description,
                    }),
                    severity: 'success',
                    title: intl.formatMessage({
                        id: title,
                    }),
                });

                trackEvent(logEvent, payload);
            },
            async (payload: any) => {
                trackEvent(logEvent, payload);

                const imcompatibleCollections =
                    payload?.job_status?.incompatible_collections;
                if (hasLength(imcompatibleCollections)) {
                    setIncompatibleCollections(imcompatibleCollections);
                }

                onFailure({
                    error: {
                        title: dryRun
                            ? `${messagePrefix}.test.failedErrorTitle`
                            : `${messagePrefix}.save.failedErrorTitle`,
                    },
                });
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        updateFormStatus(status);

        if (draftId) {
            if (collections && collections.length > 0) {
                const draftSpecResponse = await getDraftSpecsBySpecTypeReduced(
                    draftId,
                    'collection'
                );

                if (draftSpecResponse.error) {
                    return onFailure({
                        error: {
                            title: 'captureEdit.generate.failedErrorTitle',
                            error: draftSpecResponse.error,
                        },
                    });
                } else if (
                    draftSpecResponse.data &&
                    draftSpecResponse.data.length > 0
                ) {
                    const unboundCollections = draftSpecResponse.data
                        .map((query) => query.catalog_name)
                        .filter(
                            (collection) => !collections.includes(collection)
                        );

                    const deleteDraftSpecsResponse =
                        await deleteDraftSpecsByCatalogName(
                            draftId,
                            'collection',
                            unboundCollections
                        );
                    if (deleteDraftSpecsResponse.error) {
                        return onFailure({
                            error: {
                                title: 'captureEdit.generate.failedErrorTitle',
                                error: deleteDraftSpecsResponse.error,
                            },
                        });
                    }
                }
            }

            const response = await createPublication(
                draftId,
                dryRun ?? false,
                entityDescription
            );
            if (response.error) {
                onFailure({
                    error: {
                        title: `${messagePrefix}.save.failure.errorTitle`,
                        error: response.error,
                    },
                });
            } else {
                waitForPublishToFinish(response.data[0].logs_token, draftId);
                setFormState({
                    logToken: response.data[0].logs_token,
                    showLogs: true,
                });
            }
        } else {
            logRocketEvent('Entity:Create:Missing draftId');
            onFailure({
                error: {
                    title: `${messagePrefix}.save.failure.errorTitle`,
                    error: intl.formatMessage({
                        id: 'entityCreate.errors.missingDraftId',
                    }),
                },
            });
        }
    };

    return (
        <Button
            onClick={save}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage
                id={dryRun === true ? 'cta.testConfig' : 'cta.saveEntity'}
            />
        </Button>
    );
}

export default EntityCreateSave;
