import type { BaseComponentProps } from 'src/types';

import { Paper, Stack } from '@mui/material';

import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'src/context/Theme';

function Tile({ children }: BaseComponentProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                'height': '100%',
                'padding': 1,
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                'boxShadow':
                    'rgb(50 50 93 / 7%) 0px 2px 5px -1px, rgb(0 0 0 / 10%) 0px 1px 3px -1px',
                'borderRadius': 3,
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                },
            }}
        >
            <Stack
                style={{
                    height: '100%',
                    justifyContent: 'space-between',
                }}
            >
                {children}
            </Stack>
        </Paper>
    );
}

export default Tile;
