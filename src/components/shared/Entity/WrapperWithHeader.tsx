import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {header}
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}

export default WrapperWithHeader;
