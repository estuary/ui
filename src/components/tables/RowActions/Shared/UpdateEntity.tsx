import { Alert } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import Error from 'components/shared/Error';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import SharedProgress, {
    ProgressStates,
    SharedProgressProps,
} from 'components/tables/RowActions/Shared/Progress';
import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtWithSpec,
} from 'hooks/useLiveSpecsExt';
import usePublications from 'hooks/usePublications';
import { useEffect, useState } from 'react';
import { jobSucceeded } from 'services/supabase';
import { ENTITY } from 'types';

export interface UpdateEntityProps {
    entity: LiveSpecsExtQuery;
    onFinish: (response: any) => void;
    generateNewSpec: (
        spec: LiveSpecsExtQueryWithSpec['spec']
    ) => any | Promise<void>;
    generateNewSpecType: (entity: LiveSpecsExtQuery) => ENTITY | null;
    runningMessageID: SharedProgressProps['runningMessageID'];
    successMessageID: SharedProgressProps['successMessageID'];
}

function UpdateEntity({
    generateNewSpec,
    generateNewSpecType,
    entity,
    onFinish,
    runningMessageID,
    successMessageID,
}: UpdateEntityProps) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [pubID, setPubID] = useState<string | null>(null);
    const [logToken, setLogToken] = useState<string | null>(null);

    const { liveSpecs } = useLiveSpecsExtWithSpec(
        entity.last_pub_id,
        entity.spec_type
    );

    useEffect(() => {
        const failed = (response: any) => {
            setState(ProgressStates.FAILED);
            setError(response.error);
            onFinish(response);
        };

        if (liveSpecs.length > 0) {
            const updateEntity = async (
                targetEntity: LiveSpecsExtQuery,
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

                const publishResponse = await createPublication(
                    newDraftId,
                    false
                );
                if (publishResponse.error) {
                    return failed(publishResponse);
                }
                setLogToken(publishResponse.data[0].logs_token);
                setPubID(publishResponse.data[0].id);
            };

            void updateEntity(entity, liveSpecs[0].spec);
        }

        // We only want to run the useEffect after the data is fetched
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveSpecs]);

    const { publication } = usePublications(pubID, true);
    useEffect(() => {
        const done = jobSucceeded(publication?.job_status);
        if (done === true) {
            setState(ProgressStates.SUCCESS);
            onFinish(publication);
        } else if (done === false) {
            setState(ProgressStates.FAILED);
            setError({});
            onFinish(publication);
        }
    }, [onFinish, publication]);

    return (
        <SharedProgress
            name={entity.catalog_name}
            error={error}
            renderError={(errorProvided: any) => (
                <>
                    {errorProvided?.message ? (
                        <Error error={errorProvided} hideTitle={true} />
                    ) : null}
                    <Alert
                        icon={false}
                        severity="error"
                        sx={{
                            maxHeight: 100,
                            overflowY: 'auto',
                        }}
                    >
                        <DraftErrors draftId={draftId} />
                    </Alert>
                </>
            )}
            renderLogs={() => {
                <ErrorLogs
                    logToken={logToken}
                    height={150}
                    logProps={{
                        disableIntervalFetching: true,
                        fetchAll: true,
                    }}
                />;
            }}
            state={state}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
        />
    );
}

export default UpdateEntity;
