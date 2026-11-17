import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';
import { normalizeError } from 'src/utils/errors';

const CREATE_DISCOVER = graphql(`
    mutation CreateDiscover(
        $draftId: Id!
        $captureName: Name!
        $dataPlane: String
    ) {
        createDiscover(
            draftId: $draftId
            captureName: $captureName
            dataPlane: $dataPlane
        ) {
            id
        }
    }
`);

interface CreatedDiscover {
    id: string;
    logsToken?: string;
}

/**
 * Queues a discover of the capture as it's drafted in `draftId` (or, if it
 * isn't drafted, as it's live). The discover writes its results to the draft.
 */
export const useCreateDiscover = () => {
    const [, createDiscover] = useMutation(CREATE_DISCOVER);

    return useCallback(
        async (
            draftId: string,
            captureName: string,
            dataPlane?: string
        ): Promise<Result<CreatedDiscover>> => {
            const result = await createDiscover({
                draftId,
                captureName,
                dataPlane,
            });

            if (result.error) {
                const error = normalizeError(result.error);
                return { error };
            }
            if (!result.data) {
                return { error: new Error('discover not created') };
            }

            const { id } = result.data.createDiscover;

            // The logs viewer currently requires the logs token. GraphQL doesn't
            // expose the logs token, so need to fetch it from supabase for now.
            // TODO: Remove this once the logs viewer is migrated to GraphQL.
            const logsTokenResponse = await getDiscoverLogsToken(id);
            const logsToken = logsTokenResponse.data?.logs_token;

            return { value: { id, logsToken } };
        },
        [createDiscover]
    );
};

async function getDiscoverLogsToken(discoverId: string) {
    interface LogsTokenRow {
        logs_token: string;
    }

    return await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DISCOVERS)
                .select(`logs_token`)
                .eq('id', discoverId)
                .single(),
        'getDiscoverLogsToken'
    ).then(handleSuccess<LogsTokenRow>, handleFailure);
}
