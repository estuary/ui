import type { MouseEvent} from 'react';
import { useState } from 'react';

import { Button } from '@mui/material';

import PopperWrapper from 'src/components/shared/PopperWrapper';
import type { ButtonWithPopperProps } from 'src/components/shared/buttons/types';


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
