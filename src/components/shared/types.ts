import type { SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';

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
    sx?: SxProps;

    // Only for the special cards for alert summary on dashboard page (as of Q4 2025)
    opaqueLightMode?: boolean;
}
