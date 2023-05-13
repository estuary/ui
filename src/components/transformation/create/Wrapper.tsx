import { Box } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { BaseComponentProps } from 'types';

function StepWrapper({ children }: BaseComponentProps) {
    return (
        <Box
            sx={{
                border: (theme) => defaultOutline[theme.palette.mode],
                borderRadius: 3,
                flex: 1,
            }}
        >
            {children}
        </Box>
    );
}

// const StepWrapper = styled(Box)<BoxProps & { last?: boolean }>(({ theme }) => ({
//     border: defaultOutline[theme.palette.mode],
//     borderRadius: 3,
//     flex: 1,
//     // Prevents the white background of the header from chopping off
//     //the rounded corners of the border
//     // overflow: 'hidden',
// }));

export default StepWrapper;
