import type { SubscriberAccordionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { AccordionDetails, Stack } from '@mui/material';

import AlertTypeField from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/AlertTypeField';
import EmailListField from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/EmailListField';

const Details = ({ subscription }: SubscriberAccordionProps) => {
    return (
        <AccordionDetails style={{ paddingLeft: 32, paddingRight: 32 }}>
            <Stack spacing={3}>
                <EmailListField subscription={subscription} />

                <AlertTypeField subscription={subscription} />
            </Stack>
        </AccordionDetails>
    );
};

export default Details;
