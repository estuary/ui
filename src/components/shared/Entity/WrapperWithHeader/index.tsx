import { Accordion, AccordionDetails, useTheme } from '@mui/material';
import Header from 'components/shared/Entity/WrapperWithHeader/Header';
import { defaultOutline } from 'context/Theme';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
    forceClose?: boolean;
    forceOpen?: boolean;
    disableClose?: boolean;
    mountClosed?: boolean;
    readOnly?: boolean;
    hideBorder?: boolean;
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
    forceOpen,
    disableClose,
    mountClosed,
    readOnly,
    hideBorder,
}: Props) {
    const theme = useTheme();

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

        if (forceOpen) {
            setExpanded(true);
        }
    }, [forceClose, forceOpen]);

    return (
        <Accordion
            square
            expanded={expanded}
            onChange={handlers.change}
            sx={{
                borderBottom:
                    expanded || hideBorder
                        ? 'none'
                        : defaultOutline[theme.palette.mode],
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
