import { Button, ButtonProps, PopperProps } from '@mui/material';
import PopperWrapper from 'components/shared/PopperWrapper';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    buttonProps: Partial<ButtonProps>;
    messageId: string;
    popper: ReactNode;
    popperProps?: Partial<PopperProps>;
}

function ButtonWithPopper({
    buttonProps,
    messageId,
    popper,
    popperProps,
}: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <Button {...buttonProps} onClick={togglePopper}>
                <FormattedMessage id={messageId} />
            </Button>

            <PopperWrapper
                anchorEl={anchorEl}
                open={open}
                popperProps={popperProps}
                setOpen={setOpen}
            >
                {popper}
            </PopperWrapper>
        </>
    );
}

export default ButtonWithPopper;
