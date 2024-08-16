import {
    deleteDraftSpecsByCatalogName,
    getDraftSpecsBySpecTypeReduced,
} from 'api/draftSpecs';
import { createPublication, getPublicationByIdQuery } from 'api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_queryResponse_mutate,
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setPubId,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { DEFAULT_FILTER } from 'services/supabase';
import { CustomEvents } from 'services/types';
import {
    useBinding_collections,
    useBinding_disabledBindings,
    useBinding_fullSourceErrorsExist,
} from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
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
    dryRun?: boolean
) {
    const intl = useIntl();

    const { jobStatusPoller } = useJobStatusPoller();

    const status = dryRun ? FormStatus.TESTING : FormStatus.SAVING;

    // Draft Editor Store
    const setPubId = useEditorStore_setPubId();

    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const entityDescription = useDetailsFormStore(
        (state) => state.details.data.description
    );

    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const collections = useBinding_collections();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();
    const disabledBindings = useBinding_disabledBindings(entityType);

    const waitForPublishToFinish = useCallback(
        (publicationId: string, hideNotification?: boolean) => {
            updateFormStatus(status, hideNotification);
            setIncompatibleCollections([]);

            jobStatusPoller(
                getPublicationByIdQuery(publicationId),
                async (payload: any) => {
                    const formStatus = dryRun
                        ? FormStatus.TESTED
                        : FormStatus.SAVED;

                    // TODO This allows the URL to stay in sync after saving
                    //  helpful if in the future we want to allow a user to pick up
                    //  where they left off.
                    // if (!dryRun) {
                    //     setSearchParams(
                    //         {
                    //             ...Object.fromEntries(searchParams),
                    //             [GlobalSearchParams.LAST_PUB_ID]: payload.id,
                    //         },
                    //         { replace: true }
                    //     );
                    // }
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
            dryRun,
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
            updateFormStatus,
        ]
    );

    return useCallback(
        async (draftId: string | null, hideLogs?: boolean) => {
            // FullSource updates the draft directly and does not require a new generation so
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
            if (collections.length > 0) {
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

                    // Drafted collections should not be removed in the capture create workflow
                    // or when testing the draft.
                    const disabledCollections: string[] =
                        dryRun || workflow === 'capture_create'
                            ? []
                            : disabledBindings;

                    const deleteDraftSpecsResponse =
                        await deleteDraftSpecsByCatalogName(
                            draftId,
                            'collection',
                            [...unboundCollections, ...disabledCollections]
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
            disabledBindings,
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
            workflow,
        ]
    );
}

export default useSave;
