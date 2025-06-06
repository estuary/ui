import type { CustomEvents } from 'src/services/types';

import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import {
    deleteDraftSpecsByCatalogName,
    getDraftSpecsBySpecTypeReduced,
} from 'src/api/draftSpecs';
import {
    createPublication,
    getPublicationByIdQuery,
} from 'src/api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import {
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setPubId,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { DEFAULT_FILTER, logRocketEvent } from 'src/services/shared';
import {
    useBinding_collections,
    useBinding_fullSourceErrorsExist,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_setShowSavePrompt,
    useFormStateStore_updateStatus,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';
import { hasLength } from 'src/utils/misc-utils';
import { getCollectionName } from 'src/utils/workflow-utils';

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

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();
    const [backfillDataflow] = useBindingStore((state) => [
        state.backfillDataFlow,
    ]);

    // Draft Editor Store
    const setPubId = useEditorStore_setPubId();

    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
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
    const isEdit = useEntityWorkflow_Editing();

    const collections = useBinding_collections();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

    const showPreSavePrompt = useMemo(
        () => Boolean(isEdit && !dryRun && backfillDataflow),
        [backfillDataflow, dryRun, isEdit]
    );

    const waitForPublishToFinish = useCallback(
        (publicationId: string, hideNotification?: boolean) => {
            updateFormStatus(status, hideNotification);
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

            if (!showPreSavePrompt) {
                // All the validation is done and we can start saving
                updateFormStatus(status, hideLogs);
            }

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

                    // For a test we do not want to remove from draft - otherwise we would need
                    //  to add them back in after the test.
                    const disabledCollections: string[] =
                        dryRun || entityType !== 'capture'
                            ? []
                            : draftSpecs[0].spec.bindings
                                  .filter((binding: any) => binding.disable)
                                  .map((binding: any) =>
                                      getCollectionName(binding)
                                  );

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

            if (showPreSavePrompt) {
                setIncompatibleCollections([]);
                setShowSavePrompt(true);
                return;
            }

            const response = await createPublication(
                draftId,
                dryRun ?? false,
                undefined,
                dataPlaneName?.whole
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

            setIncompatibleCollections([]);
            waitForPublishToFinish(response.data[0].id, hideLogs);
            setFormState({
                logToken: response.data[0].logs_token,
                showLogs: !hideLogs,
            });
        },
        [
            collections,
            dataPlaneName?.whole,
            draftSpecs,
            dryRun,
            entityType,
            fullSourceErrorsExist,
            intl,
            messagePrefix,
            onFailure,
            setDiscoveredDraftId,
            setFormState,
            setIncompatibleCollections,
            setShowSavePrompt,
            showPreSavePrompt,
            status,
            updateFormStatus,
            waitForPublishToFinish,
        ]
    );
}

export default useSave;
