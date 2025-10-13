import type { AlertColor, SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';

// TODO (AlertBox) we defaulted short to false at the start. That was a mistake
//  so we need to get `short` to default to `true` soon.
export interface AlertBoxProps extends BaseComponentProps {
    severity: AlertColor;
    short: boolean; // Forcing this on... but do not want to change all calls right now
    sx?: SxProps;
    headerMessage?: string | ReactNode;
    hideIcon?: boolean;
    onClose?: () => void;
    title?: string | ReactNode;
}

export interface RadioMenuItemProps {
    description: string;
    label: string;
    value: string;
}

interface ButtonLinkAttributes {
    href: string;
    target: string;
    rel: string;
}

export interface TileProps extends BaseComponentProps {
    clickHandler?: () => void;
    externalLink?: ButtonLinkAttributes;
    fullHeight?: boolean;
}

export interface CardWrapperProps extends BaseComponentProps {
    disableMinWidth?: boolean;
    message?: string | ReactNode;
    tooltipMessageId?: string;
    height?: string | number;
    opaqueLightMode?: boolean;
    sx?: SxProps;
}
