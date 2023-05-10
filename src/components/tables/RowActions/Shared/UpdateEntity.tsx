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
import { useEffect, useState } from 'react';
import { jobSucceeded } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { Entity } from 'types';

export interface UpdateEntityProps {
    entity: CaptureQuery;
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
        | SelectTableStoreNames.MATERIALIZATION;
}

function UpdateEntity({
    generateNewSpec,
    generateNewSpecType,
    entity,
    onFinish,
    runningMessageID,
    successMessageID,
    selectableStoreName,
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
        const failed = (response: any) => {
            setState(ProgressStates.FAILED);
            setError(response.error ?? response);
            onFinish(response);
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
            const entityName = targetEntity.catalog_name;

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return failed(draftsResponse);
            }

            const newDraftId = draftsResponse.data[0].id;
            setDraftId(newDraftId);

            const draftSpecsResponse = await createDraftSpec(
                newDraftId,
                entityName,
                generateNewSpec(spec),
                generateNewSpecType(targetEntity)
            );
            if (draftSpecsResponse.error) {
                return failed(draftSpecsResponse);
            }

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

    const { publication } = usePublications(pubID, true);
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
            renderError={(errorProvided: any) => {
                return (
                    <>
                        <AlertBox short hideIcon severity="error">
                            <DraftErrors draftId={draftId} />
                        </AlertBox>
                        {errorProvided?.message ? (
                            <Error error={errorProvided} condensed />
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
