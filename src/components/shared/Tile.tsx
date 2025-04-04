import type { TileProps } from 'src/components/shared/types';

import { ButtonBase } from '@mui/material';

import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'src/context/Theme';

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

function Tile({ children, clickHandler, externalLink, fullHeight }: TileProps) {
    return (
        <ButtonBase
            href={externalLink?.href ?? ''}
            target={externalLink?.target}
            rel={externalLink?.rel}
            onClick={clickHandler}
            sx={{
                'width': '100%',
                'height': fullHeight ? '100%' : undefined,
                'padding': 1,
                'display': 'block',
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                boxShadow,
                'border': 'none',
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
        </ButtonBase>
    );
}

export default Tile;
