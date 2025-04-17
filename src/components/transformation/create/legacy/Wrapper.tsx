import type { BoxProps } from '@mui/material';

import { Box, styled } from '@mui/material';

// TODO (transform / legacy wrapper): Remove this component when the new transform create workflow can be released
//   because it is only used in the legacy workflow.
export const LegacyStepWrapper = styled(Box)<BoxProps & { last?: string }>(
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
