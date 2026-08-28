import type { AlertColor, SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { forwardRef } from 'react';

import { AlertTitle, Box, IconButton, useTheme } from '@mui/material';

import {
    CheckCircle,
    InfoCircle,
    WarningHexagon,
    WarningTriangle,
    Xmark,
} from 'iconoir-react';

import { BandedDiv } from 'src/components/shared/BandedDiv';
import { paperBackground } from 'src/context/Theme';

// Alert copy, softened off pure black in light mode so the severity band stays
// the loudest thing in the box.
const ALERT_TEXT = {
    light: 'rgba(0, 0, 0, 0.8)',
    dark: 'rgb(255, 255, 255)',
};

const SEVERITY_ICON = {
    error: WarningHexagon,
    warning: WarningTriangle,
    info: InfoCircle,
    success: CheckCircle,
};

// Iconoir icons render at 1.5em, so an explicit width/height is the only way
// to get the px size asked for.
const ICON_SIZE = 20;

export interface AlertBoxProps {
    severity: AlertColor;
    children?: ReactNode;
    /** Leaves the severity band bare, with no icon in it. */
    hideIcon?: boolean;
    /** Adds a close button to the end of the alert's first row. */
    onClose?: () => void;
    sx?: SxProps<Theme>;
    title?: ReactNode;
}

/**
 * A severity-banded box for messages the user has to read: the band carries
 * the severity color and its icon, and the face carries the copy.
 *
 * The ref lands on the alert's content, which is what a caller scrolling an
 * alert into view wants to reach.
 */
export const AlertBox = forwardRef<HTMLDivElement, AlertBoxProps>(
    function AlertBox(
        { severity, children, hideIcon, onClose, sx, title },
        ref
    ) {
        const theme = useTheme();

        const Icon = SEVERITY_ICON[severity];

        return (
            <BandedDiv
                side="left"
                radius="sm"
                bandColor={theme.palette[severity][theme.palette.mode]}
                label={
                    hideIcon ? undefined : (
                        <Icon width={ICON_SIZE} height={ICON_SIZE} />
                    )
                }
                faceSx={{
                    px: 1.5,
                    py: 1,
                    background: paperBackground[theme.palette.mode],
                    color: ALERT_TEXT[theme.palette.mode],
                }}
                sx={sx}
            >
                <Box
                    ref={ref}
                    role="alert"
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {title ? <AlertTitle>{title}</AlertTitle> : null}

                        {children}
                    </Box>

                    {onClose ? (
                        <IconButton
                            aria-label="Close"
                            onClick={onClose}
                            size="small"
                            sx={{ color: 'inherit', flex: 'none' }}
                        >
                            <Xmark width={16} height={16} />
                        </IconButton>
                    ) : null}
                </Box>
            </BandedDiv>
        );
    }
);

export default AlertBox;
