import {
    Box,
    Button,
    ClickAwayListener,
    Fade,
    Popper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { logDialogBackground, popperIndex } from 'context/Theme';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    popper: ReactNode;
}

function MessageWithPopper({ messageId, popper }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const canBeOpen = open && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const handlers = {
        togglePopper: (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
            setOpen((previousOpen) => !previousOpen);
        },
        externalAreaClicked: () => {
            setOpen(false);
        },
    };

    return (
        <FormattedMessage
            id={messageId}
            tagName={Box}
            values={{
                buttonLabel: (
                    <>
                        <Button
                            variant="text"
                            size="small"
                            onClick={handlers.togglePopper}
                            sx={{ mb: 0.5 }}
                        >
                            <FormattedMessage id={`${messageId}.buttonLabel`} />
                        </Button>

                        <Popper
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            transition
                            sx={{ zIndex: popperIndex }}
                        >
                            {({ TransitionProps }) => (
                                <ClickAwayListener
                                    onClickAway={handlers.externalAreaClicked}
                                >
                                    <Fade {...TransitionProps} timeout={350}>
                                        <Box
                                            sx={{
                                                maxWidth: belowMd ? 450 : 650,
                                                p: 2,
                                                borderRadius: 5,
                                                bgcolor:
                                                    logDialogBackground[
                                                        theme.palette.mode
                                                    ],
                                            }}
                                        >
                                            {popper}
                                        </Box>
                                    </Fade>
                                </ClickAwayListener>
                            )}
                        </Popper>
                    </>
                ),
            }}
        />
    );
}

export default MessageWithPopper;
