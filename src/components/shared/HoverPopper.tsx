import type { PopperProps } from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';

import { useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';

import PopperWrapper from 'src/components/shared/PopperWrapper';

interface Props {
    children: ReactNode;
    popperContent: ReactNode;
    popperProps?: Partial<PopperProps>;
}

// Delay before closing so the mouse can travel from the anchor into the popper
// without it disappearing. The popper renders in a portal so there is no DOM
// parent/child relationship between the two.
const CLOSE_DELAY_MS = 100;

function HoverPopper({ children, popperContent, popperProps }: Props) {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = () => {
        if (closeTimer.current !== null) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    };

    const handleAnchorEnter = (event: MouseEvent<HTMLElement>) => {
        clearCloseTimer();
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    useEffect(() => clearCloseTimer, []);

    return (
        <>
            <Box
                component="span"
                onMouseEnter={handleAnchorEnter}
                onMouseLeave={scheduleClose}
            >
                {children}
            </Box>
            <PopperWrapper
                anchorEl={anchorEl}
                open={open}
                setOpen={setOpen}
                popperProps={popperProps}
            >
                <Box
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleClose}
                >
                    {popperContent}
                </Box>
            </PopperWrapper>
        </>
    );
}

export default HoverPopper;
