import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import { zIndexIncrement } from 'context/Theme';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
    hideIcon?: boolean;
}

const ExternalLink = ({ children, link, hideIcon }: Props) => {
    const onClick = (event: any) => {
        event.stopPropagation();
    };

    return (
        <Button
            variant="text"
            endIcon={!hideIcon ? <OpenInNewIcon /> : null}
            href={link}
            target="_blank"
            rel="noopener"
            color="secondary"
            onClick={onClick}
            sx={{
                padding: 0,
                fontWeight: 700,
                zIndex: zIndexIncrement + zIndexIncrement,
            }}
        >
            {children}
        </Button>
    );
};

export default ExternalLink;
