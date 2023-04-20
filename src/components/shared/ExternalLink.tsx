import { Button, ButtonTypeMap, SxProps } from '@mui/material';
import { linkButtonSx } from 'context/Theme';
import { OpenNewWindow } from 'iconoir-react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
    color?: ButtonTypeMap['props']['color'];
    hideIcon?: boolean;
    padding?: number;
    sx?: SxProps;
    variant?: ButtonTypeMap['props']['variant'];
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
