import {
    Box,
    ClickAwayListener,
    Fade,
    Popper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { logDialogBackground, popperIndex } from 'context/Theme';
import { Dispatch, ReactNode, SetStateAction } from 'react';

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
        >
            {({ TransitionProps }) => (
                <ClickAwayListener onClickAway={externalAreaClicked}>
                    <Fade {...TransitionProps} timeout={350}>
                        <Box
                            sx={{
                                maxWidth: belowMd ? 450 : 650,
                                p: 2,
                                borderRadius: 5,
                                boxShadow: 2,
                                bgcolor:
                                    logDialogBackground[theme.palette.mode],
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
