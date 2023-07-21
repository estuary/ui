import { Dispatch, ReactNode, SetStateAction } from 'react';

import {
    Box,
    ClickAwayListener,
    Fade,
    Popper,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { paperBackground, popperIndex } from 'context/Theme';

interface Props {
    children: ReactNode;
    anchorEl: HTMLElement | null;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function PopperWrapper({ children, anchorEl, open, setOpen }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const canBeOpen = open && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const externalAreaClicked = () => {
        setOpen(false);
    };

    return (
        <Popper
            id={id}
            open={open}
            anchorEl={anchorEl}
            transition
            sx={{ zIndex: popperIndex }}
            // TODO (MUI Typing) - https://github.com/mui/material-ui/issues/35287
            onResize={undefined}
            onResizeCapture={undefined}
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
