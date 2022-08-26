import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import { headerLinkIndex } from 'context/Theme';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
    hideIcon?: boolean;
    padding?: number;
}

const ExternalLink = ({ children, link, hideIcon, padding }: Props) => {
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
                'padding': padding ? padding : 0,
                'fontWeight': 500,
                'zIndex': headerLinkIndex,
                'borderBottom': 1,
                'borderRadius': 0,
                'mx': 1,
                '&:hover, &:focus': {
                    fontWeight: 700,
                },
            }}
        >
            {children}
        </Button>
    );
};

export default ExternalLink;
