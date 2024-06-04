import { logRocketConsole } from 'services/shared';
import { JOB_STATUS_SUCCESS } from 'services/supabase';
import { hasLength } from './misc-utils';

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

    logRocketConsole('Poller : response : trying again');
    return [null, response];
};
