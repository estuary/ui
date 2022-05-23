import { Alert } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { encryptConfig } from 'api/sops';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import useConnectorTag from 'hooks/useConnectorTag';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import usePublications from 'hooks/usePublications';
import produce from 'immer';
import { useEffect, useState } from 'react';
import { jobSucceeded } from 'services/supabase';

interface Props {
    entity: LiveSpecsExtQuery;
    onFinish: (response: any) => void;
    enabling: boolean;
}

function DisableEnableProgress({ enabling, entity, onFinish }: Props) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
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
            const makeDisableCall = async (
                targetEntity: LiveSpecsExtQuery,
                spec: any
            ) => {
                const entityName = targetEntity.catalog_name;

                const draftsResponse = await createEntityDraft(entityName);
                if (draftsResponse.error) {
                    return failed(draftsResponse);
                }

                const encryptedEndpointConfig = await encryptConfig(
                    connectorTag.endpoint_spec_schema,
                    spec.endpoint.connector.config
                );
                if (encryptedEndpointConfig.error) {
                    return failed(encryptedEndpointConfig);
                }

                const newDraftId = draftsResponse.data[0].id;
                setDraftId(newDraftId);

                const draftSpec = generateDraftSpec(
                    encryptedEndpointConfig.data,
                    `${entity.connector_image_name}${entity.connector_image_tag}`
                );

                draftSpec.bindings = spec.bindings ? spec.bindings : [];
                draftSpec.shards = spec.shards ? { ...spec.shards } : {};
                draftSpec.shards.disable = !enabling;

                const draftSpecsResponse = await createDraftSpec(
                    newDraftId,
                    entityName,
                    draftSpec,
                    'capture'
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

            const updatedSpec = produce(liveSpecs[0].spec, (spec) => {
                // TODO (typing) this is only optional because the hook takes an option
                if (spec) {
                    delete spec.endpoint.connector.config.sops;
                }
            });
            void makeDisableCall(entity, updatedSpec);
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
            renderError={() => (
                <Alert
                    severity="error"
                    sx={{
                        maxHeight: 100,
                        overflowY: 'scroll',
                    }}
                >
                    <DraftErrors draftId={draftId} />
                </Alert>
            )}
            state={state}
            successMessageID={enabling ? 'common.enabled' : 'common.disabled'}
            runningMessageID={enabling ? 'common.enabling' : 'common.disabling'}
        />
    );
}

export default DisableEnableProgress;
