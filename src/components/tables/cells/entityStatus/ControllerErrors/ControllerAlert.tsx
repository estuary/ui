import type { ControllerAlertProps } from 'src/components/tables/cells/entityStatus/ControllerErrors/types';

import { useState } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowDown } from 'iconoir-react';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import { defaultOutline } from 'src/context/Theme';

export default function ControllerAlert({
    error,
    hideBorder,
    mountClosed,
}: ControllerAlertProps) {
    const theme = useTheme();

    const [expanded, setExpanded] = useState(!mountClosed);

    return (
        <Accordion
            defaultExpanded={!mountClosed}
            onChange={() => setExpanded(!expanded)}
            sx={{
                borderBottom:
                    expanded || hideBorder
                        ? 'none'
                        : defaultOutline[theme.palette.mode],
            }}
        >
            <AccordionSummary
                expandIcon={
                    <NavArrowDown
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    />
                }
            >
                <Typography>{error.scope}</Typography>
            </AccordionSummary>

            <AccordionDetails>
                <Box sx={{ height: 100 }}>
                    <ServerErrorDetail val={error.detail} />
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
