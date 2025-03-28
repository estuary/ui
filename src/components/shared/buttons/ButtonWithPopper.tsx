import { MouseEvent, useState } from 'react';

import { Button } from '@mui/material';

import { ButtonWithPopperProps } from './types';

import PopperWrapper from 'src/components/shared/PopperWrapper';

function ButtonWithPopper({
    buttonProps,
    children,
    popper,
    popperProps,
}: ButtonWithPopperProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <Button {...buttonProps} onClick={togglePopper}>
                {children}
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
