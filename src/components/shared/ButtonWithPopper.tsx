import { Button, SxProps, Theme } from '@mui/material';
import PopperWrapper from 'components/shared/PopperWrapper';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    popper: ReactNode;
    disabled?: boolean;
    startIcon?: ReactNode;
    buttonSx?: SxProps<Theme>;
}

function ButtonWithPopper({
    messageId,
    popper,
    disabled,
    startIcon,
    buttonSx,
}: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <Button
                disabled={disabled}
                startIcon={startIcon}
                onClick={togglePopper}
                sx={buttonSx}
            >
                <FormattedMessage id={messageId} />
            </Button>

            <PopperWrapper anchorEl={anchorEl} open={open} setOpen={setOpen}>
                {popper}
            </PopperWrapper>
        </>
    );
}

export default ButtonWithPopper;
