import type { SxProps, Theme } from '@mui/material';
import type { MouseEvent, ReactNode, Ref } from 'react';

import { Link } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';

export interface ExternalLinkOptions {
    linkRef?: Ref<HTMLAnchorElement>;
    sx?: SxProps<Theme>;
}

interface Props extends ExternalLinkOptions {
    children: ReactNode;
    link: string;
}

const ExternalLink = ({ children, link, sx, linkRef }: Props) => {
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <Link
            ref={linkRef}
            href={link}
            target="_blank"
            rel="noopener"
            onClick={onClick}
            sx={{
                'display': 'inline-flex',
                'alignItems': 'center',
                'gap': 0.5,
                'color': 'secondary.main',
                'textDecoration': 'none',
                '&:hover, &:focus': {
                    textDecoration: 'underline',
                },
                ...sx,
            }}
        >
            {children}
            <OpenNewWindow style={{ fontSize: '.75em' }} />
        </Link>
    );
};

export default ExternalLink;
