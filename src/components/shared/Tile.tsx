import { Paper } from '@mui/material';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { BaseComponentProps } from 'types';

type TileProps = BaseComponentProps;
function Tile({ children }: TileProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                'maxWidth': 500,
                'height': '100%',
                'padding': 1,
                'flexGrow': 1,
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
            {children}
        </Paper>
    );
}

export default Tile;
