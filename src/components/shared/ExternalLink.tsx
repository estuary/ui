import type { ButtonTypeMap, SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { Button } from '@mui/material';
import { linkButtonSx } from 'context/Theme';
import { OpenNewWindow } from 'iconoir-react';

export interface ExternalLinkOptions {
    color?: ButtonTypeMap['props']['color'];
    hideIcon?: boolean;
    padding?: number;
    sx?: SxProps;
    variant?: ButtonTypeMap['props']['variant'];
}

interface Props extends ExternalLinkOptions {
    children: ReactNode;
    link: string;
}

const ExternalLink = ({
    color,
    children,
    link,
    hideIcon,
    sx,
    variant,
}: Props) => {
    const onClick = (event: any) => {
        event.stopPropagation();
    };

    const styling = sx ?? ({} as any);

    return (
        <Button
            variant={variant ?? 'text'}
            endIcon={
                !hideIcon ? <OpenNewWindow style={{ fontSize: 12 }} /> : null
            }
            href={link}
            target="_blank"
            rel="noopener"
            color={color ?? 'secondary'}
            onClick={onClick}
            sx={{ ...linkButtonSx, ...styling }}
        >
            {children}
        </Button>
    );
};

export default ExternalLink;
