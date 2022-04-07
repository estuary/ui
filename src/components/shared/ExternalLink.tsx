import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
}

const ExternalLink = ({ children, link }: Props) => {
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
};

export default ExternalLink;
