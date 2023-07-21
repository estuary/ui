import { MouseEvent, ReactNode, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { Box, Button } from '@mui/material';

import PopperWrapper from 'components/shared/PopperWrapper';

interface Props {
    messageId: string;
    popper: ReactNode;
}

function MessageWithPopper({ messageId, popper }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
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
                            onClick={togglePopper}
                            sx={{ mb: 0.5 }}
                        >
                            <FormattedMessage id={`${messageId}.buttonLabel`} />
                        </Button>

                        <PopperWrapper
                            anchorEl={anchorEl}
                            open={open}
                            setOpen={setOpen}
                        >
                            {popper}
                        </PopperWrapper>
                    </>
                ),
            }}
        />
    );
}

export default MessageWithPopper;
