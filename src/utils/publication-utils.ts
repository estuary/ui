import { logRocketConsole } from 'src/services/shared';
import { JOB_STATUS_SUCCESS } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

export const checkIfPublishIsDone = (payload: any): [boolean | null, any] => {
    const response =
        (payload && hasLength(payload.data) && payload.data[0]) ?? null;

    if (response?.job_status?.type && response.job_status.type !== 'queued') {
        logRocketConsole(
            `Poller : response : ${response.job_status.type}`,
            response
        );

        return [
            JOB_STATUS_SUCCESS.includes(response.job_status.type),
            response,
        ];
    }

    return [null, response];
};
