import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR, JOB_TYPE_FAILURE } from 'services/supabase';

function useJobStatusErrorHandler() {
    const intl = useIntl();

    return useCallback(
        (error: any) => {
            if (error.job_status) {
                let message;
                if (error.job_status === JOB_TYPE_FAILURE) {
                    message = intl.formatMessage({ id: '' });
                }

                return {
                    ...BASE_ERROR,
                    hint: error.logs_token,
                    message,
                };
            }

            return error;
        },
        [intl]
    );
}

export default useJobStatusErrorHandler;
