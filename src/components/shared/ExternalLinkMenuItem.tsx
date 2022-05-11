import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link, MenuItem } from '@mui/material';
import { ReactNode } from 'react';

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
                fontWeight: 700,
                px: 3,
                py: 1.5,
                textTransform: 'uppercase',
            }}
        >
            <span>{children}</span>
            <OpenInNewIcon sx={{ height: 20, width: 36 }} />
        </MenuItem>
    );
}

export default ExternalLinkMenuItem;
