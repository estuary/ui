import { Box, BoxProps, styled } from '@mui/material';

export const StepBox = styled(Box)<BoxProps & { last?: boolean }>(
    ({ theme, last }) => ({
        border: '1px solid #9AB5CB',
        borderRadius: 3,
        flex: 1,
        // Prevents the white background of the header from chopping off
        //the rounded corners of the border
        overflow: 'hidden',
        ...(!last
            ? {
                  [theme.breakpoints.down('sm')]: {
                      marginBottom: 24,
                  },
                  [theme.breakpoints.up('sm')]: {
                      marginRight: 24,
                  },
              }
            : {}),
    })
);
