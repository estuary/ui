import { Button } from '@mui/material';
import PopperWrapper from 'components/shared/PopperWrapper';
import { MouseEvent, ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    popper: ReactNode;
    startIcon?: ReactNode;
}

function ButtonWithPopper({ messageId, popper, startIcon }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <Button
                startIcon={startIcon}
                onClick={togglePopper}
                sx={{ mb: 0.5 }}
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
