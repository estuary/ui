import type { FocusEvent, MouseEvent } from 'react';
import type { ButtonWithPopperProps } from 'src/components/shared/buttons/types';

import { useState } from 'react';

import { IconButton } from '@mui/material';

import PopperWrapper from 'src/components/shared/PopperWrapper';

const IconButtonWithPopper = ({
    buttonProps,
    children,
    popper,
    popperProps,
    trigger = 'click',
}: ButtonWithPopperProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<
        null | HTMLElement | (EventTarget & Element)
    >(null);

    const togglePopper = (event: MouseEvent<HTMLElement> | FocusEvent) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <IconButton
                {...buttonProps}
                onClick={
                    trigger === 'click' || trigger === undefined
                        ? togglePopper
                        : undefined
                }
                onMouseEnter={trigger === 'hover' ? togglePopper : undefined}
                onMouseLeave={trigger === 'hover' ? togglePopper : undefined}
            >
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
