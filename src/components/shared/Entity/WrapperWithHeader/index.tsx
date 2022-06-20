import { Accordion, AccordionDetails } from '@mui/material';
import Header from 'components/shared/Entity/WrapperWithHeader/Header';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
    forceClose?: boolean;
}

function WrapperWithHeader({ header, children, forceClose }: Props) {
    const [expanded, setExpanded] = useState(true);
    const handlers = {
        change: () => {
            setExpanded(!expanded);
        },
    };

    useEffect(() => {
        if (forceClose) {
            setExpanded(false);
        }
    }, [forceClose]);

    return (
        <Accordion
            expanded={expanded}
            onChange={handlers.change}
            sx={{
                mt: 2,
            }}
        >
            <Header expanded={expanded}>{header}</Header>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}

export default WrapperWithHeader;
