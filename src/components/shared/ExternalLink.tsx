import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { Link } from '@mui/material';

import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface Props {
    children: ReactNode;
    link: string;
    sx?: SxProps<Theme>;
}

const ExternalLink = ({ children, link, sx }: Props) => {
    return (
        <Link
            href={link}
            target="_blank"
            rel="noopener"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 500,
                ...sx,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
            <ExternalLinkIcon />
        </Link>
    );
};

export default ExternalLink;
