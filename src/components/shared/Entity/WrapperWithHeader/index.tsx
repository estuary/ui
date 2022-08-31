import { Accordion, AccordionDetails } from '@mui/material';
import Header from 'components/shared/Entity/WrapperWithHeader/Header';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
    forceClose?: boolean;
    disableClose?: boolean;
}

function WrapperWithHeader({
    header,
    children,
    forceClose,
    disableClose,
}: Props) {
    const [expanded, setExpanded] = useState(true);
    const handlers = {
        change: () => {
            setExpanded(disableClose ?? !expanded);
        },
    };

    useEffect(() => {
        if (forceClose) {
            setExpanded(false);
        }
    }, [forceClose]);

    return (
        <Accordion
            square
            expanded={expanded}
            onChange={handlers.change}
            sx={{
                mt: 2,
            }}
        >
            <Header expanded={expanded} disableClose={disableClose}>
                {header}
            </Header>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}

export default WrapperWithHeader;
