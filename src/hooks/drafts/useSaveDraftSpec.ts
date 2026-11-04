import type {
    CaptureDraftSpec,
    MaterializationsDraftSpec,
} from 'src/hooks/drafts/useGetDraftSpec';
import type { EntityWithCreateWorkflow } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { graphql } from 'src/gql-types';
import { getEndpointFromSpecDef } from 'src/utils/connector-utils';
import { isEncryptedConfig } from 'src/utils/sops-utils';

const UNSUPPORTED_CONFIG = new Error(
    'Only connector or dekaf configurations are supported'
);
const UNENCRYPTED_CONFIG_ERROR = new Error(
    'The endpoint config must be encrypted before it is saved'
);

const STAGE_DRAFT_SPECS = graphql(`
    mutation StageDraftSpecs($draftId: Id!, $specs: [DraftSpecInput!]!) {
        stageDraftSpecs(draftId: $draftId, specs: $specs)
    }
`);

export function useSaveDraftSpec(
    catalogType: 'capture'
): ReturnType<typeof useSaveCaptureDraftSpec>;
export function useSaveDraftSpec(
    catalogType: 'materialization'
): ReturnType<typeof useSaveMaterializationDraftSpec>;

export function useSaveDraftSpec(catalogType: EntityWithCreateWorkflow) {
    const saveCaptureDraftSpec = useSaveCaptureDraftSpec();
    const saveMaterializationDraftSpec = useSaveMaterializationDraftSpec();

    switch (catalogType) {
        case 'capture':
            return saveCaptureDraftSpec;
        case 'materialization':
            return saveMaterializationDraftSpec;
    }
}

const useSaveCaptureDraftSpec = () => {
    const [, stageDraftSpecs] = useMutation(STAGE_DRAFT_SPECS);

    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            draftSpec: CaptureDraftSpec
        ): Promise<Result<CaptureDraftSpec>> => {
            const endpoint = getEndpointFromSpecDef(draftSpec.spec);
            if (!endpoint?.config) {
                return { error: UNSUPPORTED_CONFIG };
            }
            // saving expects an encryted config
            if (!isEncryptedConfig(endpoint.config)) {
                return { error: UNENCRYPTED_CONFIG_ERROR };
            }

            // Staging replaces every field, so the drafted precondition is
            // passed back or it's cleared
            const result = await stageDraftSpecs({
                draftId,
                specs: {
                    catalogName,
                    catalogType: 'capture',
                    model: draftSpec.spec,
                    expectPubId: draftSpec.expect_pub_id,
                },
            });

            if (result.error) {
                return { error: result.error };
            }
            if (!result.data || result.data.stageDraftSpecs.length <= 0) {
                return { error: new Error('draft spec not saved') };
            }

            return { value: draftSpec };
        },
        [stageDraftSpecs]
    );
};

const useSaveMaterializationDraftSpec = () => {
    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            draftSpec: MaterializationsDraftSpec,
            update: boolean
        ): Promise<Result<MaterializationsDraftSpec>> => {
            const endpoint = getEndpointFromSpecDef(draftSpec.spec);
            if (!endpoint?.config) {
                return { error: UNSUPPORTED_CONFIG };
            }
            if (!isEncryptedConfig(endpoint.config)) {
                return { error: UNENCRYPTED_CONFIG_ERROR };
            }

            // If there is a draft already with task data then update. We do not match on
            //   the catalog name as the user could change the name. There is a small issue
            //      if someone updates their draft on the CLI and adds multiple materializations
            //      there will be an issue. This will need to be handled eventually but by then
            //      we should move the UI to the "shopping cart" approach.
            const response = update
                ? await modifyDraftSpec(
                      draftSpec.spec,
                      {
                          draft_id: draftId,
                          spec_type: 'materialization',
                      },
                      catalogName
                  )
                : await createDraftSpec(
                      draftId,
                      catalogName,
                      draftSpec.spec,
                      'materialization',
                      draftSpec.expect_pub_id
                  );

            if (response.error) {
                return { error: response.error };
            }
            if (!response.data || response.data.length === 0) {
                return { error: new Error('draft spec not saved') };
            }

            return { value: draftSpec };
        },
        []
    );
};
