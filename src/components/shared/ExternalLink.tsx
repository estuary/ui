import { Button } from '@mui/material';
import { linkButtonSx } from 'context/Theme';
import { OpenNewWindow } from 'iconoir-react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    link: string;
    hideIcon?: boolean;
    padding?: number;
}

const ExternalLink = ({ children, link, hideIcon }: Props) => {
    const onClick = (event: any) => {
        event.stopPropagation();
    };

    return (
        <Button
            variant="text"
            endIcon={
                !hideIcon ? <OpenNewWindow style={{ fontSize: 12 }} /> : null
            }
            href={link}
            target="_blank"
            rel="noopener"
            color="secondary"
            onClick={onClick}
            sx={linkButtonSx}
        >
            {children}
        </Button>
    );
};

export default ExternalLink;
