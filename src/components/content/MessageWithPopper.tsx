import { Box, Button, Fade, Popper } from '@mui/material';
import { logDialogBackground, popperIndex } from 'context/Theme';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    popper: ReactNode;
}

// TODO (defect): Determine whether a Popover component or a modified Popper component
//   should be used. Both have a number of tradeoffs, so it is truly a matter of what
//   component is easiest to manipulate to achieve the desired functionality.
function MessageWithPopper({ messageId, popper }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const canBeOpen = open && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
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
                            onClick={handleClick}
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
                                <Fade {...TransitionProps} timeout={350}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 5,
                                            bgcolor: (theme) =>
                                                logDialogBackground[
                                                    theme.palette.mode
                                                ],
                                        }}
                                    >
                                        {popper}
                                    </Box>
                                </Fade>
                            )}
                        </Popper>
                    </>
                ),
            }}
        />
    );
}

export default MessageWithPopper;
