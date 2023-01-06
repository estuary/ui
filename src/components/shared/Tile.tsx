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
                'borderRadius': 5,
                'maxWidth': 500,
                'flexGrow': 1,
                'background': (theme) =>
                    semiTransparentBackgroundIntensified[theme.palette.mode],
                'padding': 1,
                'height': '100%',
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackground[theme.palette.mode],
                },
            }}
        >
            {children}
        </Paper>
    );
}

export default Tile;
