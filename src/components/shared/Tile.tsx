import { Paper } from '@mui/material';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { BaseComponentProps } from 'types';

type TileProps = BaseComponentProps;

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

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
                boxShadow,
                'borderRadius': 3,
                '&:hover': {
                    boxShadow,
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
