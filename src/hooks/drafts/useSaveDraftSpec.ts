import type { CaptureDef, MaterializationDef } from 'deps/flow/flow';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { graphql } from 'src/gql-types';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { validateEndpointConfig } from 'src/utils/workflow-utils';

const STAGE_DRAFT_SPECS = graphql(`
    mutation StageDraftSpecs($draftId: Id!, $specs: [DraftSpecInput!]!) {
        stageDraftSpecs(draftId: $draftId, specs: $specs)
    }
`);

/**
 * Callback hook that writes the task's spec into its draft. Resolves to the
 * error, if any.
 */
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
            expectPubId: string | null,
            specDef: CaptureDef
        ): Promise<Error | null> => {
            const configError = validateEndpointConfig(specDef);
            if (configError) {
                return configError;
            }

            // Staging replaces every field, so the drafted precondition is
            // passed back or it's cleared
            const result = await stageDraftSpecs({
                draftId,
                specs: [
                    {
                        catalogType: 'capture',
                        catalogName: catalogName,
                        expectPubId: expectPubId,
                        model: specDef,
                    },
                ],
            });

            if (result.error) {
                return result.error;
            }
            if (!result.data || result.data.stageDraftSpecs.length <= 0) {
                return new Error('draft spec not saved');
            }

            return null;
        },
        [stageDraftSpecs]
    );
};

// Updates the drafted materialization in place, so a rename keeps it
const useSaveMaterializationDraftSpec = () => {
    const getDraftSpec = useGetDraftSpec('materialization');

    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            expectPubId: string | null,
            specDef: MaterializationDef
        ): Promise<Error | null> => {
            const configError = validateEndpointConfig(specDef);
            if (configError) {
                return configError;
            }

            // need to check if the materialization draft exists as
            // renames need to happen in place and not stage a new draft
            // TODO: Remove once stageDraftSpecs can rename a materialization
            // spec in place, so this can use the same mutation.
            const existingRes = await getDraftSpec(draftId);
            if (existingRes.error) {
                return existingRes.error;
            }

            // If there is a draft already with task data then update. We do not match on
            //   the catalog name as the user could change the name. There is a small issue
            //      if someone updates their draft on the CLI and adds multiple materializations
            //      there will be an issue. This will need to be handled eventually but by then
            //      we should move the UI to the "shopping cart" approach.
            const response = Boolean(existingRes.value)
                ? await modifyDraftSpec(
                      specDef,
                      {
                          draft_id: draftId,
                          spec_type: 'materialization',
                      },
                      catalogName
                  )
                : await createDraftSpec(
                      draftId,
                      catalogName,
                      specDef,
                      'materialization',
                      expectPubId
                  );

            if (response.error) {
                return response.error;
            }
            if (!response.data || response.data.length === 0) {
                return new Error('draft spec not saved');
            }

            return null;
        },
        [getDraftSpec]
    );
};
