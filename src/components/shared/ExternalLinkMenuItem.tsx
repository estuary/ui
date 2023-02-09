import { Link, MenuItem } from '@mui/material';
import { OpenNewWindow } from 'iconoir-react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
}

export const externalLinkStyling = {
    bgcolor: 'none',
    color: 'text.primary',
    fontSize: 14,
    fontWeight: 500,
    px: 3,
    py: 1.5,
    textTransform: 'uppercase',
};

function ExternalLinkMenuItem({ children, link }: Props) {
    return (
        <MenuItem
            component={Link}
            href={link}
            target="_blank"
            rel="noopener"
            tabIndex={0}
            sx={externalLinkStyling}
        >
            <span>{children}</span>

            <OpenNewWindow style={{ height: 20, width: 36 }} />
        </MenuItem>
    );
}

export default ExternalLinkMenuItem;
