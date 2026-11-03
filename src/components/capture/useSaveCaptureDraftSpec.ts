import type { CaptureDef } from 'deps/flow/flow';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';
import { validateEndpointConfig } from 'src/utils/workflow-utils';

const STAGE_DRAFT_SPECS = graphql(`
    mutation StageDraftSpecs($draftId: Id!, $specs: [DraftSpecInput!]!) {
        stageDraftSpecs(draftId: $draftId, specs: $specs)
    }
`);

/**
 * Callback hook that stages the capture's spec into its draft. Resolves to
 * the error, if any.
 */
export function useSaveCaptureDraftSpec() {
    const [, stageDraftSpecs] = useMutation(STAGE_DRAFT_SPECS);
    const usesSecrets = useSecretsStore_usesSecrets();

    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            expectPubId: string | null,
            specDef: CaptureDef
        ): Promise<Error | null> => {
            const configError = validateEndpointConfig(specDef, usesSecrets);
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
        [stageDraftSpecs, usesSecrets]
    );
}
