import { TileProps } from 'components/shared/types';
import { ReactNode } from 'react';

export interface CardProps {
    Detail: ReactNode;
    Logo: ReactNode;
    Title: ReactNode;
    clickHandler?: () => void;
    CTA?: ReactNode;
    docsUrl?: string;
    entityType?: string;
    externalLink?: TileProps['externalLink'];
    recommended?: boolean;
}

export interface ConnectorRequestCardProps {
    condensed?: boolean;
}

export interface LogoProps {
    imageSrc: string | null | undefined;
    maxHeight?: string | number;
    padding?: string | number;
    unknownConnectorIconConfig?: {
        width: string | number;
        fontSize: string | number;
    };
}

export interface MessageComponentProps {
    content: string;
    marginBottom?: string | number;
}
