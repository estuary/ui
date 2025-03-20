import { LinearProgress, Stack, Typography } from '@mui/material';
import { RegistrationProgressProps } from './types';

const TOTAL_STEPS = 2;

function RegistrationProgress({
    loading,
    status,
    step,
}: RegistrationProgressProps) {
    if (status === 'outdated') {
        return null;
    }

    return (
        <Stack sx={{ pb: 1, width: '100%' }}>
            <Typography>
                Step {step} of {TOTAL_STEPS}
            </Typography>
            <LinearProgress
                variant={loading ? 'indeterminate' : 'determinate'}
                value={Math.floor(((step - 1) / TOTAL_STEPS) * 100)}
            />
        </Stack>
    );
}

export default RegistrationProgress;
