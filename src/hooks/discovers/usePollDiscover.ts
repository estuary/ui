import type { JobStatus } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { DEFAULT_FILTER, logRocketEvent } from 'src/services/shared';
import { TABLES } from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';
import { CustomEvents } from 'src/services/types';

interface DiscoverJob {
    capture_name: string;
    draft_id: string;
    job_status: JobStatus;
    created_at: string;
}

interface DiscoverError {
    error: string | { message: string };
}

/**
 * Returns a function that waits for the latest discover of `draftId` to
 * finish. Resolves to the finished job, or to an error if the job failed or
 * polling did.
 */
export const usePollDiscover = () => {
    const { jobStatusPoller } = useJobStatusPoller();

    // The returned error is a string because the poll can return an error
    // code instead of an Error, so current callers are expecting a string.
    // TODO: make this an actual Error.
    return useCallback(
        (draftId: string) =>
            new Promise<Result<DiscoverJob, string>>((resolve) => {
                jobStatusPoller(
                    supabaseClient
                        .from(TABLES.DISCOVERS)
                        .select(
                            `
                            capture_name,
                            draft_id,
                            job_status,
                            created_at
                        `
                        )
                        .match({
                            draft_id: draftId,
                        })
                        .order('created_at', { ascending: false }),
                    (payload: DiscoverJob) => {
                        trackEvent(payload);
                        resolve({ value: payload });
                    },
                    (payload: DiscoverJob | DiscoverError) => {
                        trackEvent(payload);

                        // job finished but failed
                        if ('job_status' in payload) {
                            resolve({ error: payload.job_status.type });
                            return;
                        }

                        // job didn't finish due to some error
                        // (postgres error, unknown, etc...)
                        resolve({
                            error:
                                typeof payload.error === 'string'
                                    ? payload.error
                                    : payload.error.message,
                        });
                    }
                );
            }),
        [jobStatusPoller]
    );
};

const trackEvent = (payload: any) => {
    logRocketEvent(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name ?? DEFAULT_FILTER,
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? payload.error ?? DEFAULT_FILTER,
    });
};
