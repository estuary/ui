import { Button, SxProps, Theme } from '@mui/material';
import PopperWrapper from 'components/shared/PopperWrapper';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    popper: ReactNode;
    buttonSx?: SxProps<Theme>;
    disabled?: boolean;
    startIcon?: ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
}

function ButtonWithPopper({
    messageId,
    popper,
    disabled,
    startIcon,
    variant,
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
                variant={variant}
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
