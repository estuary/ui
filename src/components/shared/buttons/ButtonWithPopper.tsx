import type { MouseEvent } from 'react';
import type { ButtonWithPopperProps } from 'src/components/shared/buttons/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import PopperWrapper from 'src/components/shared/PopperWrapper';

function ButtonWithPopper({
    buttonProps,
    children,
    popper,
    popperProps,
    trigger = 'click',
}: ButtonWithPopperProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const togglePopper = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <>
            <Button
                {...buttonProps}
                onClick={
                    trigger === 'click' || trigger === undefined
                        ? togglePopper
                        : undefined
                }
                onMouseEnter={
                    trigger === 'hover'
                        ? (event: MouseEvent<HTMLElement>) => {
                              setAnchorEl(event.currentTarget);
                              setOpen(true);
                          }
                        : undefined
                }
                onMouseLeave={
                    trigger === 'hover'
                        ? (event: MouseEvent<HTMLElement>) => {
                              setAnchorEl(event.currentTarget);
                              setOpen(false);
                          }
                        : undefined
                }
            >
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
