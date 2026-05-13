import type { SubscriberAccordionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Accordion, useTheme } from '@mui/material';

import Details from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo/Details';
import Summary from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo/Summary';
import { defaultOutline, defaultOutlineColor_hovered } from 'src/context/Theme';

const SubscriberInfo = ({
    subscription,
}: Omit<SubscriberAccordionProps, 'expanded'>) => {
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
                'backgroundColor':
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                'border': defaultOutline[theme.palette.mode],
                '&:hover': {
                    borderColor:
                        defaultOutlineColor_hovered[theme.palette.mode],
                },
                [`&:first-of-type`]: {
                    borderRadius: '6px',
                },
            }}
        >
            <Summary expanded={expanded} subscription={subscription} />

            <Details subscription={subscription} />
        </Accordion>
    );
};

export default SubscriberInfo;
