import type { RegistrationProgressProps } from './types';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

const totalSteps = 2;

function RegistrationProgress({
    loading,
    status,
    step,
}: RegistrationProgressProps) {
    const intl = useIntl();

    if (status === 'outdated') {
        return null;
    }

    return (
        <Stack sx={{ pb: 1, width: '100%' }}>
            <Typography>
                {intl.formatMessage(
                    { id: 'login.progress.indicator' },
                    {
                        step,
                        totalSteps,
                    }
                )}
            </Typography>
            <LinearProgress
                variant={loading ? 'indeterminate' : 'determinate'}
                value={Math.floor(((step - 1) / totalSteps) * 100)}
            />
        </Stack>
    );
}

export default RegistrationProgress;
