import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import { ReactNode } from 'react';

interface ExternalLink {
    children: ReactNode;
    link: string;
}

function ExternalLink(props: ExternalLink) {
    const { children, link } = props;

    return (
        <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            href={link}
            target="_blank"
            rel="noopener"
            color="secondary"
            sx={{
                fontWeight: 700,
            }}
        >
            {children}
        </Button>
    );
}

export default ExternalLink;
