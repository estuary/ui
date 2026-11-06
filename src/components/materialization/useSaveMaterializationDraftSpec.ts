import type { MaterializationDef } from 'deps/flow/flow';

import { useCallback } from 'react';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';
import { validateEndpointConfig } from 'src/utils/workflow-utils';

/**
 * Callback hook that writes the materialization's spec into its draft,
 * updating the drafted materialization in place so a rename keeps it.
 * Resolves to the error, if any.
 */
export function useSaveMaterializationDraftSpec() {
    const getDraftSpec = useGetDraftSpec('materialization');
    const usesSecrets = useSecretsStore_usesSecrets();

    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            expectPubId: string | null,
            specDef: MaterializationDef
        ): Promise<Error | null> => {
            const configError = validateEndpointConfig(specDef, usesSecrets);
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
        [getDraftSpec, usesSecrets]
    );
}
