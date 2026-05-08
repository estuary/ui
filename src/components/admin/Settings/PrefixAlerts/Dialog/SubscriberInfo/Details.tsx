import type { SubscriberAccordionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { AccordionDetails, Stack, useTheme } from '@mui/material';

import AlertTypeField from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeField';
import EmailListField from 'src/components/admin/Settings/PrefixAlerts/Dialog/EmailListField';
import { defaultOutline, defaultOutline_hovered } from 'src/context/Theme';

const Details = ({
    alertTypes,
    email,
    expanded,
    hovered,
}: SubscriberAccordionProps) => {
    const theme = useTheme();

    const borderStyle =
        hovered && expanded
            ? defaultOutline_hovered[theme.palette.mode]
            : defaultOutline[theme.palette.mode];

    return (
        <AccordionDetails
            style={{
                borderBottom: borderStyle,
                borderLeft: borderStyle,
                borderRight: borderStyle,
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
            }}
        >
            <Stack spacing={3}>
                <EmailListField staticEmail={email} />

                <AlertTypeField existingAlertTypes={alertTypes} />
            </Stack>
        </AccordionDetails>
    );
};

export default Details;
