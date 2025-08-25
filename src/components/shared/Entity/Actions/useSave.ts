import type { LiveSpecsExtQuery_ByCatalogNames } from 'src/api/liveSpecsExt';
import type {
    DraftSpecsExtQuery_BySpecTypeReduced,
    MassCreateDraftSpecsData,
    MassUpdateMatchData,
} from 'src/api/types';
import type { CustomEvents } from 'src/services/types';

import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import {
    deleteDraftSpecsByCatalogName,
    getDraftSpecsBySpecTypeReduced,
    massCreateDraftSpecs,
    massUpdateDraftSpecs,
} from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
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
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { DEFAULT_FILTER, logRocketEvent } from 'src/services/shared';
import {
    useBinding_collections,
    useBinding_collectionsBeingBackfilled,
    useBinding_fullSourceErrorsExist,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
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

    // Draft Editor Store
    const setPubId = useEditorStore_setPubId();

    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
    );

    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();
    const [backfillMode] = useBindingStore((state) => [state.backfillMode]);

    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const entityType = useEntityType();

    const collections = useBinding_collections();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

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
                        // generated on each publication.
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
                    if (dryRun) {
                        // Materialization field selection sources content from the built spec and validation response
                        // generated on each publication.
                        if (mutateDraftSpecs) {
                            void mutateDraftSpecs();
                        }
                    }

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

    const collectionResetEnabled = useMemo(
        () =>
            Boolean(
                backfillMode === 'reset' &&
                    entityType === 'capture' &&
                    collectionsBeingBackfilled.length > 0
            ),
        [backfillMode, collectionsBeingBackfilled.length, entityType]
    );

    const updateResetOnCollections = useCallback(
        async (
            draftId: string,
            collectionsOnDraft: DraftSpecsExtQuery_BySpecTypeReduced[] | null,
            collectionsBeingRemovedFromDraft: any,
            skipNonBackfilledCheck: boolean,
            generateUpdatedSpec: (
                draftSpec: DraftSpecsExtQuery_BySpecTypeReduced
            ) => MassUpdateMatchData | null
        ) => {
            const collectionsToUpdate: MassUpdateMatchData[] = [];
            if (collectionsOnDraft) {
                collectionsOnDraft.forEach((draftSpec) => {
                    // If we are removing it we do not need to update
                    if (
                        collectionsBeingRemovedFromDraft.includes(
                            draftSpec.catalog_name
                        )
                    ) {
                        return;
                    }

                    // skip = disable clean up
                    // If the user enabled `data flow reset` and then totally turns off backfill
                    //  when we are cleaning up we want to make sure we remove the `reset` prop
                    //  so we do not care if the collection is not being backfilled or not
                    if (!skipNonBackfilledCheck) {
                        // don't skip = enable inital update
                        // If it is not being backfill we do not need to update. This is important for when
                        //  a user has run a re-discover and they have a bunch of collections on their draft
                        if (
                            !collectionsBeingBackfilled.includes(
                                draftSpec.catalog_name
                            )
                        ) {
                            return;
                        }
                    }

                    const updatedSpec = generateUpdatedSpec(draftSpec);

                    if (updatedSpec) {
                        collectionsToUpdate.push(updatedSpec);
                    }
                });
            }
            const massUpdateResponse = await massUpdateDraftSpecs(
                draftId,
                'collection',
                collectionsToUpdate
            );
            if (massUpdateResponse.error) {
                onFailure({
                    error: {
                        title: 'captureEdit.generate.failedErrorTitle',
                        error: massUpdateResponse.error,
                    },
                });
                return false;
            }

            return true;
        },
        [collectionsBeingBackfilled, onFailure]
    );

    const handleCollectionReset = useCallback(
        async (
            draftId: string,
            collectionsOnDraft: DraftSpecsExtQuery_BySpecTypeReduced[] | null,
            collectionNamesOnDraft: string[] | null,
            collectionsBeingRemovedFromDraft: any
        ) => {
            if (!collectionResetEnabled) {
                // Go through and clean up the reset flag on all the collections
                //  we do not want to simply remove these because the user may have
                //  re-discovered or they edited the collection while backfilling
                const response = await updateResetOnCollections(
                    draftId,
                    collectionsOnDraft,
                    collectionsBeingRemovedFromDraft,
                    true, // Do not skip non-backfilled options as we need to clean up everything
                    (draftSpec) => {
                        if (draftSpec?.spec?.reset === true) {
                            // Remove the reset setting
                            const { reset, ...theRest } = draftSpec.spec;

                            return {
                                catalog_name: draftSpec.catalog_name,
                                spec: {
                                    ...theRest,
                                },
                            };
                        }

                        return null;
                    }
                );

                return response;
            }

            let collectionsMissingFromDraft: string[] = [];

            if (collectionNamesOnDraft && collectionNamesOnDraft.length > 0) {
                // Go through and see if the collections are already on the draft
                collectionsBeingBackfilled.forEach((value, index) => {
                    if (
                        !collectionsBeingRemovedFromDraft.includes(value) &&
                        !collectionNamesOnDraft?.includes(value)
                    ) {
                        collectionsMissingFromDraft.push(value);
                    }
                });
            } else {
                // No collections are on the draft yet so we have to add them all
                collectionsMissingFromDraft = collectionsBeingBackfilled;
            }

            if (collectionsMissingFromDraft.length > 0) {
                // Fetch the live spec of all collections that aren't on the draft
                const { data, error } = await getLiveSpecsByCatalogNames(
                    'collection',
                    collectionsMissingFromDraft
                );
                if (error || !data) {
                    onFailure({
                        error: {
                            title: 'captureEdit.generate.failedErrorTitle',
                            error: error,
                        },
                    });

                    return false;
                }

                // Add missing collections to the draft with the reset property set
                const collectionsToInsert: MassCreateDraftSpecsData[] = data
                    .filter(
                        (
                            liveSpec
                        ): liveSpec is LiveSpecsExtQuery_ByCatalogNames =>
                            Boolean(liveSpec)
                    )
                    .map((liveSpec) => {
                        return {
                            catalog_name: liveSpec.catalog_name,
                            expect_pub_id: liveSpec.last_pub_id,
                            spec: {
                                ...liveSpec.spec,
                                reset: true,
                            },
                        };
                    });

                const massCreateResponse = await massCreateDraftSpecs(
                    draftId,
                    'collection',
                    collectionsToInsert
                );
                if (massCreateResponse.error) {
                    onFailure({
                        error: {
                            title: 'captureEdit.generate.failedErrorTitle',
                            error: massCreateResponse.error,
                        },
                    });
                    return false;
                }
            }

            // Update collections on the draft with the reset property set
            //  Make sure to merge in `reset` with the current spec as they
            //  may have edited other things as well.
            const response = await updateResetOnCollections(
                draftId,
                collectionsOnDraft,
                collectionsBeingRemovedFromDraft,
                false, // do NOT skip checking if the items are backfilled or not
                (draftSpec) => {
                    // If the spec is not already marked for reset go ahead and do it now
                    if (draftSpec?.spec?.reset !== true) {
                        return {
                            catalog_name: draftSpec.catalog_name,
                            spec: {
                                ...draftSpec.spec,
                                reset: true,
                            },
                        };
                    }

                    return null;
                }
            );
            return response;
        },
        [
            collectionResetEnabled,
            collectionsBeingBackfilled,
            onFailure,
            updateResetOnCollections,
        ]
    );

    const handleCollections = useCallback(
        async (draftId: string) => {
            let collectionsBeingRemovedFromDraft: string[] = [];

            // Look for every collection on the draft.
            const collectionsOnDraftSpecResponse =
                await getDraftSpecsBySpecTypeReduced(draftId, 'collection');
            if (collectionsOnDraftSpecResponse.error) {
                onFailure({
                    error: {
                        title: 'captureEdit.generate.failedErrorTitle',
                        error: collectionsOnDraftSpecResponse.error,
                    },
                });

                return false;
            }

            // We need to track what is already on the draft so we do not overwrite
            //  any changes the user made while we mark reset=true
            let collectionNamesOnDraft: string[] | null = null;
            if (
                collectionsOnDraftSpecResponse.data &&
                collectionsOnDraftSpecResponse.data.length > 0
            ) {
                // Now that we are making a call we can delete the
                //  draftId used for showing discovery errors
                setDiscoveredDraftId(null);

                // Get a list of all the collections on the draft spec.
                //  During create - this will often be all collections
                //  During edit - this will often only be the ones the user edited
                collectionNamesOnDraft =
                    collectionsOnDraftSpecResponse.data.map(
                        (datum) => datum.catalog_name
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

                // Get all the collections that might still be in the UI state but are not
                //    needed as they are not on the draft
                const unboundCollections = collectionNamesOnDraft.filter(
                    (collection) => !collections.includes(collection)
                );
                collectionsBeingRemovedFromDraft = [
                    ...unboundCollections,
                    ...disabledCollections,
                ];

                // Clean up the unbound and disabled collections so that they cannot cause issues
                //  with the save/publish
                const deleteDraftSpecsResponse =
                    await deleteDraftSpecsByCatalogName(
                        draftId,
                        'collection',
                        collectionsBeingRemovedFromDraft
                    );
                if (deleteDraftSpecsResponse.error) {
                    onFailure({
                        error: {
                            title: 'captureEdit.generate.failedErrorTitle',
                            error: deleteDraftSpecsResponse.error,
                        },
                    });
                    return false;
                }
            }

            const handleCollectionResetResponse = await handleCollectionReset(
                draftId,
                collectionsOnDraftSpecResponse.data,
                collectionNamesOnDraft,
                collectionsBeingRemovedFromDraft
            );

            return handleCollectionResetResponse;
        },
        [
            collections,
            draftSpecs,
            dryRun,
            entityType,
            handleCollectionReset,
            onFailure,
            setDiscoveredDraftId,
        ]
    );

    return useCallback(
        async (draftId: string | null, hideLogs?: boolean) => {
            setFormState({
                status: FormStatus.PROCESSING,
            });

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

            if (collections.length > 0) {
                // If there are bound collections then we need to potentially handle clean up
                const response = await handleCollections(draftId);

                // If we got false back something went wrong but the call already handled
                //  showing the error so we are good to just return and not publish
                if (!response) {
                    return;
                }
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
            collections.length,
            dataPlaneName?.whole,
            dryRun,
            fullSourceErrorsExist,
            handleCollections,
            intl,
            messagePrefix,
            onFailure,
            setFormState,
            setIncompatibleCollections,
            waitForPublishToFinish,
        ]
    );
}

export default useSave;
