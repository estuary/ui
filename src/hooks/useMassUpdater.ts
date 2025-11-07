import type { CaptureQuery } from 'src/api/liveSpecsExt';
import type { MassUpdateMatchData } from 'src/api/types';
import type { SharedProgressProps } from 'src/components/tables/RowActions/Shared/types';
import type { LiveSpecsExtQueryWithSpec } from 'src/hooks/useLiveSpecsExt';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { Entity } from 'src/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createEntityDraft } from 'src/api/drafts';
import { massUpdateDraftSpecs } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
import { createPublication } from 'src/api/publications';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import usePublications from 'src/hooks/usePublications';
import { jobSucceeded } from 'src/services/supabase';

export interface UseMassUpdaterProps {
    entities: CaptureQuery[];
    onFinish: (response: any) => void;
    generateNewSpec: (
        spec: LiveSpecsExtQueryWithSpec['spec']
    ) => any | Promise<void>;
    generateNewSpecType: (entity: CaptureQuery) => Entity | null;
    runningMessageID: SharedProgressProps['runningMessageID'];
    successMessageID: SharedProgressProps['successMessageID'];
    selectableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    skippedMessageID?: SharedProgressProps['skippedMessageID'];
    validateNewSpec?: boolean;
}

function useMassUpdater({
    // entities,
    generateNewSpec,
    onFinish,
    selectableStoreName,
    skippedMessageID,
    validateNewSpec,
}: UseMassUpdaterProps) {
    const updateStarted = useRef(false);
    const publishCompleted = useRef(false);

    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [pubID, setPubID] = useState<string | null>(null);
    const [logToken, setLogToken] = useState<string | null>(null);

    // const incrementSuccessfulTransformations = useZustandStore<
    //     SelectableTableStore,
    //     SelectableTableStore['incrementSuccessfulTransformations']
    // >(
    //     selectableStoreName,
    //     selectableTableStoreSelectors.successfulTransformations.increment
    // );

    // const actionSettings = useZustandStore<
    //     SelectableTableStore,
    //     SelectableTableStore['actionSettings']
    // >(selectableStoreName, selectableTableStoreSelectors.actionSettings.get);

    // const deleteCollections =
    //     selectableStoreName === SelectTableStoreNames.CAPTURE;

    const massUpdateEntities = useCallback(
        async (targetEntities: CaptureQuery[]) => {
            // If we published or started already exit
            if (publishCompleted.current || updateStarted.current) {
                return;
            }

            // Mark that we have started updating
            updateStarted.current = true;

            const done = (progressState: ProgressStates, response: any) => {
                setState(progressState);
                onFinish(response);
            };
            const failed = (response: any) => {
                setError(response.error ?? response);
                done(ProgressStates.FAILED, response);
            };

            const catalogsNeeded = targetEntities.map(
                (datum) => datum.catalog_name
            );

            const currentLiveSpecs = await getLiveSpecsByCatalogNames(
                targetEntities[0].spec_type,
                catalogsNeeded
            );

            // Make sure we get what we need
            if (currentLiveSpecs.error) {
                return failed({ error: currentLiveSpecs.error });
            }

            if (!currentLiveSpecs.data || currentLiveSpecs.data.length < 1) {
                return failed({
                    error: {
                        message: 'updateEntity.noLiveSpecs',
                    },
                });
            }

            const newSpecs: MassUpdateMatchData[] = currentLiveSpecs.data.map(
                (datum) => {
                    const spec = generateNewSpec(datum.spec);

                    return {
                        catalog_name: datum.catalog_name,
                        // TODO (mass row actions) - do we wanna add this kinda stuff?
                        // last_pub_id: datum.last_pub_id,
                        spec,
                    };
                }
            );

            // TODO (mass row actions) - might want to validate each one
            //  and mark _some_ as skipped?
            if (validateNewSpec) {
                if (!newSpecs.every(({ spec }) => Boolean(spec))) {
                    if (skippedMessageID) {
                        setError({
                            message: skippedMessageID,
                        });
                    }
                    return done(ProgressStates.SKIPPED, {});
                }
            }

            // Start by creating a draft we can update and publish
            const draftsResponse = await createEntityDraft(
                'Delete / Enable / Disable triggered from UI'
            );
            if (draftsResponse.error) {
                return failed(draftsResponse);
            }

            // Add the specific entity to the draft and make a spec
            //  with the changed
            const newDraftId = draftsResponse.data[0].id;
            setDraftId(newDraftId);

            const updateResponse = await massUpdateDraftSpecs(
                newDraftId,
                targetEntities[0].spec_type,
                newSpecs
            );
            if (updateResponse.error) {
                return failed(updateResponse);
            }

            // if (
            //     deleteCollections &&
            //     actionSettings.deleteAssociatedCollections?.includes(entityName)
            // ) {
            //     const collectionsDraftSpecResponse =
            //         await draftCollectionsEligibleForDeletion(
            //             targetEntities.id,
            //             newDraftId
            //         );

            //     if (collectionsDraftSpecResponse.error) {
            //         return failed(collectionsDraftSpecResponse);
            //     }
            // }

            // Try to publish the changes
            const publishResponse = await createPublication(newDraftId, false);
            if (publishResponse.error) {
                return failed(publishResponse);
            }
            setPubID(publishResponse.data[0].id);
        },
        [generateNewSpec, onFinish, skippedMessageID, validateNewSpec]
    );

    // Start fetching publication status.
    //  If update is running keep checking
    //  If update is done stop checking
    const { publication } = usePublications(
        pubID,
        state === ProgressStates.RUNNING
    );
    useEffect(() => {
        const success = jobSucceeded(publication?.job_status);

        // Either we don't know the outcome yet
        //  or we have already processed everything and can skip
        if (success === null || publishCompleted.current) {
            return;
        }

        if (success) {
            setState(ProgressStates.SUCCESS);
        } else {
            setState(ProgressStates.FAILED);
            setError({});
        }

        setLogToken(publication?.logs_token ?? null);
        onFinish(publication);
    }, [onFinish, publication]);

    useEffect(() => {
        if (state === ProgressStates.SUCCESS) {
            publishCompleted.current = true;
            // incrementSuccessfulTransformations();
        }
    }, [state]);

    return {
        massUpdateEntities,
        error,
        draftId,
        pubID,
        logToken,
        state,
    };
}

export default useMassUpdater;
