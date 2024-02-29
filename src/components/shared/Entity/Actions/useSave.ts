import {
    deleteDraftSpecsByCatalogName,
    getDraftSpecsBySpecTypeReduced,
} from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import {
    useBindingsEditorStore_fullSourceErrorsExist,
    useBindingsEditorStore_setIncompatibleCollections,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_queryResponse_mutate,
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setPubId,
} from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import useClient from 'hooks/supabase-swr/hooks/useClient';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { DEFAULT_FILTER, JOB_STATUS_COLUMNS, TABLES } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { useDetailsForm_details_description } from 'stores/DetailsForm/hooks';
import {
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

const trackEvent = (logEvent: any, payload: any) => {
    logRocketEvent(logEvent, {
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        dry_run: payload.dry_run ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};

function useSave(
    logEvent: CustomEvents,
    onFailure: Function,
    dryRun?: boolean,
    forceLogsClosed?: boolean
) {
    const intl = useIntl();
    const supabaseClient = useClient();
    const { closeLogs } = useEntityWorkflowHelpers();

    const { jobStatusPoller } = useJobStatusPoller();

    const status = dryRun ? FormStatus.TESTING : FormStatus.SAVING;

    // Draft Editor Store
    const setPubId = useEditorStore_setPubId();

    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const entityDescription = useDetailsForm_details_description();

    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const collections = useResourceConfig_collections();
    const fullSourceErrorsExist =
        useBindingsEditorStore_fullSourceErrorsExist();

    const waitForPublishToFinish = useCallback(
        (publicationId: string, hideNotification?: boolean) => {
            updateFormStatus(status, hideNotification);
            setIncompatibleCollections([]);

            jobStatusPoller(
                supabaseClient
                    .from(TABLES.PUBLICATIONS)
                    .select(JOB_STATUS_COLUMNS)
                    .eq('id', publicationId),
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

                        // Materialization field selection sources content from the built spec and validation response
                        // generated on each successful publication.
                        if (mutateDraftSpecs) {
                            void mutateDraftSpecs();
                        }

                        // A log dialog associated with a dry run that is used to populate the materialization field
                        // selection table should automatically close when the publication terminates.
                        if (forceLogsClosed) {
                            closeLogs();
                        }
                    }

                    if (!hideNotification) {
                        showNotification({
                            description: intl.formatMessage({
                                id: description,
                            }),
                            severity: 'success',
                            title: intl.formatMessage({
                                id: title,
                            }),
                        });
                    }

                    trackEvent(logEvent, payload);
                },
                async (payload: any) => {
                    trackEvent(logEvent, payload);

                    const incompatibleCollections =
                        payload?.job_status?.incompatible_collections;
                    if (hasLength(incompatibleCollections)) {
                        setIncompatibleCollections(incompatibleCollections);
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
        },
        [
            closeLogs,
            dryRun,
            forceLogsClosed,
            intl,
            jobStatusPoller,
            logEvent,
            messagePrefix,
            mutateDraftSpecs,
            onFailure,
            setFormState,
            setIncompatibleCollections,
            setPubId,
            showNotification,
            status,
            supabaseClient,
            updateFormStatus,
        ]
    );

    return useCallback(
        async (draftId: string | null, hideLogs?: boolean) => {
            // FullSource updates the draft directly and does not require a new generattion so
            //  need to check for errors. We might want to add all the errors here just to be safe or
            //  in the future when we directly update drafts
            if (fullSourceErrorsExist) {
                setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: !hideLogs,
                });
                return;
            }

            if (!draftId) {
                logRocketEvent('Entity:Create:Missing draftId');
                onFailure({
                    error: {
                        title: `${messagePrefix}.save.failure.errorTitle`,
                        error: intl.formatMessage({
                            id: 'entityCreate.errors.missingDraftId',
                        }),
                    },
                });
                return;
            }

            // All the validation is done and we can start saving
            updateFormStatus(status, hideLogs);

            // If there are bound collections then we need to potentially handle clean up
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
                    // Now that we are making a call we can delete the
                    //  draftId used for showing discovery errors
                    setDiscoveredDraftId(null);

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

                return;
            }

            waitForPublishToFinish(response.data[0].id, hideLogs);
            setFormState({
                logToken: response.data[0].logs_token,
                showLogs: !hideLogs,
            });
        },
        [
            collections,
            dryRun,
            entityDescription,
            fullSourceErrorsExist,
            intl,
            messagePrefix,
            onFailure,
            setDiscoveredDraftId,
            setFormState,
            status,
            updateFormStatus,
            waitForPublishToFinish,
        ]
    );
}

export default useSave;
