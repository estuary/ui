import type { SubscriberAccordionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { AccordionDetails, Stack } from '@mui/material';

import AlertTypeField from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeField';
import EmailListField from 'src/components/admin/Settings/PrefixAlerts/Dialog/EmailListField';

const Details = ({ subscription }: SubscriberAccordionProps) => {
    const { email } = subscription;

    return (
        <AccordionDetails style={{ paddingLeft: 32, paddingRight: 32 }}>
            <Stack spacing={3}>
                <EmailListField staticEmail={email} />

                <AlertTypeField subscription={subscription} />
            </Stack>
        </AccordionDetails>
    );
};

export default Details;
