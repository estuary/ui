import type { SxProps, Theme } from '@mui/material';
import type { MouseEvent } from 'react';

import { Link } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';
import { useLeaf } from 'react-semantic-tree';

export interface ExternalLinkOptions {
    sx?: SxProps<Theme>;
}

interface Props extends ExternalLinkOptions {
    label: string;
    link: string;
}

function ExternalLink({ label, link, sx }: Props) {
    const { ref } = useLeaf(label, { href: link });
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <Link
            ref={ref}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
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
            {label}
            <OpenNewWindow style={{ fontSize: '.75em' }} />
        </Link>
    );
}

export default ExternalLink;
