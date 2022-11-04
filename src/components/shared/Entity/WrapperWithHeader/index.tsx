import { Accordion, AccordionDetails } from '@mui/material';
import Header from 'components/shared/Entity/WrapperWithHeader/Header';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
    forceClose?: boolean;
    disableClose?: boolean;
    mountClosed?: boolean;
    readOnly?: boolean;
}

const expandOnMount = (
    mountClosed: boolean | undefined,
    readOnly: boolean | undefined
): boolean => {
    if (mountClosed) {
        return !mountClosed;
    } else if (readOnly) {
        return !readOnly;
    } else {
        return true;
    }
};

function WrapperWithHeader({
    header,
    children,
    forceClose,
    disableClose,
    mountClosed,
    readOnly,
}: Props) {
    const [expanded, setExpanded] = useState(
        expandOnMount(mountClosed, readOnly)
    );
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
                my: 2,
            }}
        >
            <Header
                expanded={expanded}
                readOnly={readOnly}
                disableClose={disableClose}
            >
                {header}
            </Header>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}

export default WrapperWithHeader;
