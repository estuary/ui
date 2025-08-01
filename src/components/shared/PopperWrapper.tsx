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

import { paperBackground, popperIndex } from 'src/context/Theme';

interface Props {
    children: ReactNode;
    anchorEl: HTMLElement | (EventTarget & Element) | null;
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
            sx={{ zIndex: popperIndex }}
        >
            {({ TransitionProps }) => (
                <ClickAwayListener onClickAway={externalAreaClicked}>
                    <Fade {...TransitionProps} timeout={350}>
                        <Box
                            sx={{
                                maxWidth: belowMd ? 450 : 650,
                                p: 2,
                                borderRadius: 3,
                                boxShadow: 2,
                                bgcolor: paperBackground[theme.palette.mode],
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
