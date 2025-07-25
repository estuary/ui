import type { MouseEvent } from 'react';
import type { ButtonWithPopperProps } from 'src/components/shared/buttons/types';

import { useState } from 'react';

import { IconButton } from '@mui/material';

import PopperWrapper from 'src/components/shared/PopperWrapper';

const IconButtonWithPopper = ({
    buttonProps,
    children,
    popper,
    popperProps,
}: ButtonWithPopperProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <IconButton {...buttonProps} onClick={togglePopper}>
                {children}
            </IconButton>

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
};

export default IconButtonWithPopper;
