import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ReactNode, useState } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
    defaultExpand?: boolean;
}

function WrapperWithHeader({ header, children, defaultExpand }: Props) {
    const [expanded, setExpanded] = useState(defaultExpand ?? true);
    const handlers = {
        change: () => {
            setExpanded(!expanded);
        },
    };

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
