import { Entity } from 'types';

import { useEffect, useState } from 'react';

import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { CaptureQuery } from 'api/liveSpecsExt';
import { createPublication } from 'api/publications';

import AlertBox from 'components/shared/AlertBox';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import Error from 'components/shared/Error';
import SharedProgress, {
    ProgressStates,
    SharedProgressProps,
} from 'components/tables/RowActions/Shared/Progress';

import { useZustandStore } from 'context/Zustand/provider';

import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtWithSpec,
} from 'hooks/useLiveSpecsExt';
import usePublications from 'hooks/usePublications';

import { jobSucceeded } from 'services/supabase';

import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

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

    const liveSpecsResponse = useLiveSpecsExtWithSpec(
        entity.id,
        entity.spec_type
    );
    const liveSpecs = liveSpecsResponse.liveSpecs;
    const liveSpecsError = liveSpecsResponse.error;
    const liveSpecsValidating = liveSpecsResponse.isValidating;

    useEffect(() => {
        const done = (progressState: ProgressStates, response: any) => {
            setState(progressState);
            onFinish(response);
        };
        const failed = (response: any) => {
            setError(response.error ?? response);
            done(ProgressStates.FAILED, response);
        };

        if (liveSpecsValidating) {
            return;
        }

        if (liveSpecsError) {
            return failed({ error: liveSpecsError });
        }

        if (liveSpecs.length <= 0) {
            return failed({
                error: {
                    message: 'updateEntity.noLiveSpecs',
                },
            });
        }

        const updateEntity = async (
            targetEntity: CaptureQuery,
            spec: LiveSpecsExtQueryWithSpec['spec']
        ) => {
            // We want to make sure there is a new spec to update before
            //  calling anything on
            const newSpec = generateNewSpec(spec);
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
            );
            if (draftSpecsResponse.error) {
                return failed(draftSpecsResponse);
            }

            // Try to publish the changes
            const publishResponse = await createPublication(newDraftId, false);
            if (publishResponse.error) {
                return failed(publishResponse);
            }
            setPubID(publishResponse.data[0].id);
        };

        void updateEntity(entity, liveSpecs[0].spec);

        // We only want to run the useEffect after the data is fetched
        //  OR if there was an error
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveSpecs, liveSpecsError, liveSpecsValidating]);

    // Start fetching publication status.
    //  If update is running keep checking
    //  If update is done stop checking
    const { publication } = usePublications(
        pubID,
        state === ProgressStates.RUNNING
    );
    useEffect(() => {
        const success = jobSucceeded(publication?.job_status);

        if (success === true) {
            setState(ProgressStates.SUCCESS);
            setLogToken(publication?.logs_token ?? null);
            onFinish(publication);
        } else if (success === false) {
            setState(ProgressStates.FAILED);
            setLogToken(publication?.logs_token ?? null);
            setError({});
            onFinish(publication);
        }
    }, [onFinish, publication]);

    useEffect(() => {
        if (state === ProgressStates.SUCCESS) {
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
