import { CircularProgress, StepIconProps, useTheme } from '@mui/material';

import { pixelSize, size } from './shared';
import { CheckCircle, WarningCircle } from 'iconoir-react';

// TODO (progress icons)
// We have a few ways of doing this. We should get these all aligned.
function CustomStepIcon({ active, completed, error }: StepIconProps) {
    const theme = useTheme();

    if (error) {
        return (
            <WarningCircle
                style={{
                    color: theme.palette.error.main,
                    width: pixelSize,
                    height: pixelSize,
                }}
            />
        );
    }

    if (completed) {
        return (
            <CheckCircle
                style={{
                    color: theme.palette.success.main,
                    width: pixelSize,
                    height: pixelSize,
                }}
            />
        );
    }

    if (active) {
        return <CircularProgress color="info" size={size - 2} />;
    }

    return null;
}

export default CustomStepIcon;
