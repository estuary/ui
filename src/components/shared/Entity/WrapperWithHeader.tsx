import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
}

function WrapperWithHeader({ header, children }: Props) {
    return (
        <Accordion
            defaultExpanded
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
