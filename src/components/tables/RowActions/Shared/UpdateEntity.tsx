import type { CaptureQuery } from 'api/liveSpecsExt';
import type { LiveSpecsExtQueryWithSpec } from 'hooks/useLiveSpecsExt';
import type { SelectableTableStore } from 'stores/Tables/Store';
import type { Entity } from 'types';
import type { SharedProgressProps } from './types';
import { createEntityDraft } from 'api/drafts';
import {
    createDraftSpec,
    draftCollectionsEligibleForDeletion,
} from 'api/draftSpecs';
import { getLatestLiveSpecByName } from 'api/liveSpecsExt';
import { createPublication } from 'api/publications';
import AlertBox from 'components/shared/AlertBox';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import Error from 'components/shared/Error';
import { useZustandStore } from 'context/Zustand/provider';
import usePublications from 'hooks/usePublications';
import { useEffect, useRef, useState } from 'react';
import { jobSucceeded } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';
import SharedProgress from './Progress';
import { ProgressStates } from './types';

export interface UpdateEntityProps {
    entity: CaptureQuery;
    onFinish: (response: any) => void;
    generateNewSpec: (
        spec: LiveSpecsExtQueryWithSpec['spec']
    ) => any | Promise<void>;
    generateNewSpecType: (entity: CaptureQuery) => Entity | null;
    runningMessageID: SharedProgressProps['runningMessageID'];
    skippedMessageID?: SharedProgressProps['skippedMessageID'];
    successMessageID: SharedProgressProps['successMessageID'];
    selectableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    validateNewSpec?: boolean;
}

function UpdateEntity({
    generateNewSpec,
    generateNewSpecType,
    entity,
    onFinish,
    runningMessageID,
    skippedMessageID,
    successMessageID,
    selectableStoreName,
    validateNewSpec,
}: UpdateEntityProps) {
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

    useEffect(() => {
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

        const updateEntity = async (targetEntity: CaptureQuery) => {
            // Fetch this as late as possible so we have the latest as possible
            const liveSpecResponse = await getLatestLiveSpecByName(
                targetEntity.catalog_name
            );

            // Make sure we're good to continue
            if (liveSpecResponse.error) {
                return failed({ error: liveSpecResponse.error });
            }

            if (!liveSpecResponse.data?.spec) {
                return failed({
                    error: {
                        message: 'updateEntity.noLiveSpecs',
                    },
                });
            }

            // We want to make sure there is a new spec to update before
            //  calling anything on it
            const newSpec = generateNewSpec(liveSpecResponse.data.spec);
            if (validateNewSpec && !newSpec) {
                // If we have a skipped message ID set it to the error
                if (skippedMessageID) {
                    setError({
                        message: skippedMessageID,
                    });
                }
                return done(ProgressStates.SKIPPED, {});
            }

            // Start by creating a draft we can update and publish
            const entityName = targetEntity.catalog_name;
            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return failed(draftsResponse);
            }

            // Add the specific entity to the draft and make a spec
            //  with the changed
            const newDraftId = draftsResponse.data[0].id;
            setDraftId(newDraftId);
            const draftSpecsResponse = await createDraftSpec(
                newDraftId,
                entityName,
                newSpec,
                generateNewSpecType(targetEntity)
                // TODO (update entity) - add last pub id when we add retry for pub failure
                //  Should use a regex like this
                //  export const PUBLICATION_MISMATCH_ERROR = RegExp( `expected publication ID \d was not matched`, 'gi');
                // liveSpecResponse.data.last_pub_id
            );
            if (draftSpecsResponse.error) {
                return failed(draftSpecsResponse);
            }

            if (
                deleteCollections &&
                actionSettings.deleteAssociatedCollections?.includes(entityName)
            ) {
                const collectionsDraftSpecResponse =
                    await draftCollectionsEligibleForDeletion(
                        targetEntity.id,
                        newDraftId
                    );

                if (collectionsDraftSpecResponse.error) {
                    return failed(collectionsDraftSpecResponse);
                }
            }

            // Try to publish the changes
            const publishResponse = await createPublication(newDraftId, false);
            if (publishResponse.error) {
                return failed(publishResponse);
            }
            setPubID(publishResponse.data[0].id);
        };

        void updateEntity(entity);
    });

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
            incrementSuccessfulTransformations();
        }
    }, [state, incrementSuccessfulTransformations]);

    return (
        <SharedProgress
            name={entity.catalog_name}
            error={error}
            logToken={logToken}
            renderLogs
            renderError={(renderError_error, renderError_state) => {
                const skipped = renderError_state === ProgressStates.SKIPPED;

                return (
                    <>
                        {draftId ? (
                            <AlertBox short hideIcon severity="error">
                                <DraftErrors draftId={draftId} />
                            </AlertBox>
                        ) : null}

                        {renderError_error?.message ? (
                            <Error
                                error={renderError_error}
                                severity={skipped ? 'info' : undefined}
                                hideIcon={skipped}
                                condensed
                                hideTitle
                            />
                        ) : null}
                    </>
                );
            }}
            state={state}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
        />
    );
}

export default UpdateEntity;
