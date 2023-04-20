import {
    Step,
    StepLabel,
    Stepper,
    StepperProps as StepperPropsType,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React from 'react';

interface Props {
    num: number;
    always?: boolean;
    children?: React.ReactChild;
    StepperProps?: StepperPropsType;
}

function SingleStep({ num, always, children, StepperProps }: Props) {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const wrappedChildren = <Typography variant="h6">{children}</Typography>;

    if (isSmall || always) {
        return (
            <Stepper connector={null} {...(StepperProps ?? {})}>
                <Step sx={{ padding: 0 }} index={num - 1} active>
                    <StepLabel>{wrappedChildren}</StepLabel>
                </Step>
            </Stepper>
        );
    } else {
        return wrappedChildren;
    }
}

export default SingleStep;
