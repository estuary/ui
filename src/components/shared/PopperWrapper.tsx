import type { PopperProps } from '@mui/material';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import {
    Box,
    ClickAwayListener,
    Fade,
    Popper,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import {
    defaultOutline,
    paperBackground,
    paperBackgroundImage,
    popperIndex,
} from 'src/context/Theme';

interface Props {
    children: ReactNode;
    anchorEl: HTMLElement | null;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    popperProps?: Partial<PopperProps>;
}

function PopperWrapper({
    children,
    anchorEl,
    open,
    popperProps,
    setOpen,
}: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const canBeOpen = open && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const externalAreaClicked = () => {
        setOpen(false);
    };

    return (
        <Popper
            {...(popperProps ?? {})}
            id={id}
            open={open}
            anchorEl={anchorEl}
            transition
            sx={
                popperProps?.sx
                    ? { ...popperProps.sx, zIndex: popperIndex }
                    : { zIndex: popperIndex }
            }
        >
            {({ TransitionProps }) => (
                <ClickAwayListener onClickAway={externalAreaClicked}>
                    <Fade {...TransitionProps} timeout={350}>
                        <Box
                            sx={{
                                backgroundImage: (theme) =>
                                    paperBackgroundImage[theme.palette.mode],
                                bgcolor: paperBackground[theme.palette.mode],
                                border: (theme) =>
                                    defaultOutline[theme.palette.mode],
                                borderRadius: 3,
                                boxShadow: 2,
                                filter: 'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                                maxWidth: belowMd ? 450 : 650,
                                p: 2,
                            }}
                        >
                            {children}
                        </Box>
                    </Fade>
                </ClickAwayListener>
            )}
        </Popper>
    );
}

export default PopperWrapper;
