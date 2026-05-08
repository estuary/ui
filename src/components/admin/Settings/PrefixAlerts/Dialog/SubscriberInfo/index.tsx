import type { SubscriberInfoProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Accordion } from '@mui/material';

import Details from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo/Details';
import Summary from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo/Summary';

const SubscriberInfo = ({ subscription }: SubscriberInfoProps) => {
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState(false);

    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <Summary
                subscription={subscription}
                expanded={expanded}
                setHovered={setHovered}
            />

            <Details
                subscription={subscription}
                expanded={expanded}
                hovered={hovered}
            />
        </Accordion>
    );
};

export default SubscriberInfo;
