import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';
import { normalizeError } from 'src/utils/errors';

const CREATE_DRAFT = graphql(`
    mutation CreateDraft($detail: String) {
        createDraft(detail: $detail) {
            id
        }
    }
`);

/**
 * Callback hook that creates an empty draft owned by the user, and resolves
 * to its ID. The draft's detail is set to `entityName`, which is how the edit
 * workflow finds the entity's draft again.
 */
export function useCreateDraft() {
    const [, createDraft] = useMutation(CREATE_DRAFT);

    return useCallback(
        async (entityName: string): Promise<Result<string>> => {
            const result = await createDraft({ detail: entityName });
            if (result.error) {
                const error = normalizeError(result.error);
                return { error };
            }

            return { value: result.data!.createDraft.id };
        },
        [createDraft]
    );
}
