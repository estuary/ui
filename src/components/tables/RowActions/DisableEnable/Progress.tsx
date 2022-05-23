import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { encryptConfig } from 'api/sops';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import { useClient } from 'hooks/supabase-swr';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { useEffect, useState } from 'react';
import { startSubscription, TABLES } from 'services/supabase';

interface Props {
    entity: any;
    onFinish: (response: any) => void;
    enabling: boolean;
}

function DisableEnableProgress({ enabling, entity, onFinish }: Props) {
    const supabaseClient = useClient();
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);

    const { liveSpecs } = useLiveSpecsExt(entity.last_pub_id, true);

    useEffect(() => {
        console.log('Progress use effect');

        const failed = (response: any) => {
            console.log('response.error', response.error);

            setState(ProgressStates.FAILED);
            setError(response.error);
            onFinish(response);
        };

        const succeeded = (response: any) => {
            setState(ProgressStates.SUCCESS);
            onFinish(response);
        };

        const makeDisableCall = async (
            targetEntity: LiveSpecsExtQuery,
            spec: any
        ) => {
            console.log('enable disable', {
                enabling,
                spec,
                targetEntity,
                succeeded,
                failed,
                liveSpecs,
            });

            const entityName = targetEntity.catalog_name;

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return failed(draftsResponse);
            }

            const encryptedEndpointConfig = await encryptConfig(
                spec.bindings,
                spec.endpoint
            );
            if (encryptedEndpointConfig.error) {
                return failed(encryptedEndpointConfig);
            }

            const newDraftId = draftsResponse.data[0].id;
            const draftSpec = generateDraftSpec(
                encryptedEndpointConfig,
                `${targetEntity.connector_image_name}${targetEntity.connector_image_tag}`
            );

            const draftSpecsResponse = await createDraftSpec(
                newDraftId,
                entityName,
                draftSpec,
                'capture'
            );
            if (draftSpecsResponse.error) {
                return failed(draftSpecsResponse);
            }

            const publicationsSubscription = startSubscription(
                supabaseClient.from(TABLES.PUBLICATIONS),
                (payload: any) => {
                    return succeeded(payload);
                },
                (publishSubError: any) => {
                    return failed(publishSubError);
                }
            );

            const publishResponse = await createPublication(newDraftId, false);
            if (publishResponse.error) {
                return failed(publishResponse);
            }

            return publicationsSubscription;
        };

        if (liveSpecs.length > 0) {
            const updatedSpec = produce(liveSpecs[0].spec, (spec) => {
                // TODO (typing) this is only optional because the hook takes an option
                if (spec) {
                    if (spec.shards) {
                        spec.shards.disable = !enabling;
                    } else {
                        spec.shards = { disable: !enabling };
                    }
                }
            });
            void makeDisableCall(entity, updatedSpec);
        }
    }, [enabling, entity, liveSpecs, onFinish]);

    return (
        <SharedProgress
            name={entity.catalog_name}
            error={error}
            state={state}
            successMessageID={enabling ? 'common.enabled' : 'common.disabled'}
            runningMessageID={enabling ? 'common.enabling' : 'common.disabling'}
        />
    );
}

export default DisableEnableProgress;
