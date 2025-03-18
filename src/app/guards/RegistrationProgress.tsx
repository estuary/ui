import { LinearProgress, Stack, Typography } from '@mui/material';
import { RegistrationProgressProps } from './types';

const TOTAL_STEPS = 2;

function RegistrationProgress({ loading, step }: RegistrationProgressProps) {
    const percentage = Math.floor((step / TOTAL_STEPS) * 100);

    return (
        <Stack sx={{ width: '100%' }}>
            <Typography>
                Step {step} of {TOTAL_STEPS}
            </Typography>
            <LinearProgress
                variant={loading ? 'indeterminate' : 'determinate'}
                value={percentage}
            />
        </Stack>
    );
}

export default RegistrationProgress;
