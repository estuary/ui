import { AlertColor, SxProps } from '@mui/material';

import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export interface AlertBoxProps extends BaseComponentProps {
    severity: AlertColor;
    sx?: SxProps;
    hideIcon?: boolean;
    onClose?: () => void;
    short?: boolean;
    title?: string | ReactNode;
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
