import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import useConnectorTag from 'hooks/useConnectorTag';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import usePublications from 'hooks/usePublications';
import { useEffect, useState } from 'react';
import { jobSucceeded } from 'services/supabase';

interface Props {
    entity: LiveSpecsExtQuery;
    onFinish: (response: any) => void;
}

function DeleteProgress({ entity, onFinish }: Props) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);
    const [pubID, setPubID] = useState<string | null>(null);

    const { connectorTag } = useConnectorTag(entity.connector_id);
    const { liveSpecs } = useLiveSpecsExt(entity.last_pub_id, true);

    useEffect(() => {
        const failed = (response: any) => {
            setState(ProgressStates.FAILED);
            setError(response.error);
            onFinish(response);
        };

        if (liveSpecs.length > 0 && connectorTag) {
            const deleteEntity = async (targetEntity: LiveSpecsExtQuery) => {
                const entityName = targetEntity.catalog_name;

                const draftsResponse = await createEntityDraft(entityName);
                if (draftsResponse.error) {
                    return failed(draftsResponse);
                }

                const newDraftId = draftsResponse.data[0].id;

                const draftSpec = null;

                const draftSpecsResponse = await createDraftSpec(
                    newDraftId,
                    entityName,
                    draftSpec,
                    targetEntity.spec_type
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
                setPubID(publishResponse.data[0].id);
            };

            void deleteEntity(entity);
        }

        // We only want to run the useEffect after the data is fetched
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectorTag, liveSpecs]);

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
            state={state}
            successMessageID="common.deleted"
            runningMessageID="common.deleting"
        />
    );
}

export default DeleteProgress;
