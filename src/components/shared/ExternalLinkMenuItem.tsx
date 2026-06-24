import type { ReactNode } from 'react';

import { Link, MenuItem } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';

interface Props {
    children: ReactNode;
    link: string;
}

function ExternalLinkMenuItem({ children, link }: Props) {
    return (
        <MenuItem
            component={Link}
            href={link}
            target="_blank"
            rel="noopener"
            tabIndex={0}
            sx={{
                bgcolor: 'none',
                color: 'text.primary',
                fontSize: 14,
                fontWeight: 500,
                gap: 1,
                px: 3,
                py: 1.5,
            }}
        >
            <span>{children}</span>

            <OpenNewWindow style={{ fontSize: '0.75em' }} />
        </MenuItem>
    );
}

export default ExternalLinkMenuItem;
