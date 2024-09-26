import { CircularProgress, StepIconProps, useTheme } from '@mui/material';
import { CheckCircle, WarningCircle } from 'iconoir-react';

const size = 24;
const pixelSize = `${size}px`;

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
