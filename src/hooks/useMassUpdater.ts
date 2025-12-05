import type { CaptureQuery } from 'src/api/liveSpecsExt';
import type { MassUpdateMatchData } from 'src/api/types';
import type { SharedProgressProps } from 'src/components/tables/RowActions/Shared/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createEntityDraft } from 'src/api/drafts';
import {
    draftCollectionsEligibleForDeletion,
    massUpdateDraftSpecs,
} from 'src/api/draftSpecs';
import { getLiveSpecsForGroupedUpdates } from 'src/api/liveSpecsExt';
import { createPublication } from 'src/api/publications';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useZustandStore } from 'src/context/Zustand/provider';
import usePublications from 'src/hooks/usePublications';
import { jobSucceeded } from 'src/services/supabase';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

export interface UseMassUpdaterProps {
    entities: CaptureQuery[];
    onFinish: (response: any) => void;
    runningIntlKey: SharedProgressProps['runningIntlKey'];
    successIntlKey: SharedProgressProps['successIntlKey'];
    titleIntlKey: SharedProgressProps['titleIntlKey'];
    selectableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    skippedMessageID?: SharedProgressProps['skippedIntlKey'];
}

function useMassUpdater({
    onFinish,
    selectableStoreName,
    skippedMessageID,
}: UseMassUpdaterProps) {
    const updateStarted = useRef(false);
    const publishCompleted = useRef(false);

    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [pubID, setPubID] = useState<string | null>(null);
    const [logToken, setLogToken] = useState<string | null>(null);

    const incrementSuccessfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['incrementSuccessfulTransformations']
    >(
        selectableStoreName,
        selectableTableStoreSelectors.successfulTransformations.increment
    );

    const actionSettings = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['actionSettings']
    >(selectableStoreName, selectableTableStoreSelectors.actionSettings.get);

    const deleteCollections =
        selectableStoreName === SelectTableStoreNames.CAPTURE;

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

            // TODO (mass row actions support disable)
            //  we will need to make this query fetch the `spec` as well so
            //  it can be updated.
            const currentLiveSpecs = await getLiveSpecsForGroupedUpdates(
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

            // Start by creating a draft we can update and publish
            const draftsResponse = await createEntityDraft(
                // TODO (mass row actions support disable)
                //  Update message based on action being taken
                'Delete triggered from UI'
            );
            if (draftsResponse.error) {
                return failed(draftsResponse);
            }

            // Make the draft so while we step through the tasks
            //  we can start drafting the collections
            const newDraftId = draftsResponse.data[0].id;
            setDraftId(newDraftId);

            const draftCollectionsPromises: Array<Promise<any>> = [];
            const newSpecs: MassUpdateMatchData[] = [];
            currentLiveSpecs.data.forEach(({ catalog_name, id }) => {
                // TODO (mass row actions support disable)
                //  We will need to allow a function like generateNewSpec but we
                //  will also need to handle validateNewSpec. That gets weird now
                //  that we create a draft BEFORE generating all the specs.

                if (
                    deleteCollections &&
                    actionSettings.deleteAssociatedCollections?.includes(
                        catalog_name
                    )
                ) {
                    draftCollectionsPromises.push(
                        draftCollectionsEligibleForDeletion(id, newDraftId)
                    );
                }

                newSpecs.push({
                    catalog_name,
                    spec: null,
                });
            });

            // See if drafting the collections worked
            const draftCollectionsResponses = await Promise.all(
                draftCollectionsPromises
            );
            const draftCollectionsErrors = draftCollectionsResponses.filter(
                (r) => r.error
            );
            if (draftCollectionsErrors && draftCollectionsErrors.length > 0) {
                return failed(draftCollectionsErrors[0]);
            }

            // Put all the new specs on the draft
            const updateResponse = await massUpdateDraftSpecs(
                newDraftId,
                targetEntities[0].spec_type,
                newSpecs
            );
            if (updateResponse.error) {
                return failed(updateResponse);
            }

            // Try to publish the changes
            const DO_NOT_MERGE_WITH_DRY_RUN_TRUE = true;
            const publishResponse = await createPublication(
                newDraftId,
                DO_NOT_MERGE_WITH_DRY_RUN_TRUE
            );
            if (publishResponse.error) {
                return failed(publishResponse);
            }

            // We published so make sure the state is updated
            setPubID(publishResponse.data[0].id);

            // THIS IS NOT WORKING!!!
            // THIS IS NOT WORKING!!!
            // THIS IS NOT WORKING!!!
            // THIS IS NOT WORKING!!!
            incrementSuccessfulTransformations();
        },
        [
            actionSettings.deleteAssociatedCollections,
            deleteCollections,
            incrementSuccessfulTransformations,
            onFinish,
        ]
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
