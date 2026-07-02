import type { SubscriberAccordionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { Accordion, Stack, useTheme } from '@mui/material';

import DeleteButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/DeleteButton';
import Details from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/Details';
import Summary from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/Summary';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateSubscriptionIneligibility } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateSubscriptionIneligibility';
import { defaultOutline, defaultOutlineColor_hovered } from 'src/context/Theme';

const SubscriberInfo = ({
    subscription,
}: Omit<SubscriberAccordionProps, 'expanded'>) => {
    const theme = useTheme();

    const toggleSubscriptionViewingStatus = useAlertSubscriptionsStore(
        (state) => state.toggleSubscriptionViewingStatus
    );

    const { duplicateSubscriptionEmails, emptyEmailDetected } =
        useEvaluateSubscriptionIneligibility();

    return (
        <Accordion
            expanded={subscription.viewing}
            onChange={() => toggleSubscriptionViewingStatus(subscription.id)}
            sx={{
                'backgroundColor':
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                'border': defaultOutline[theme.palette.mode],
                'borderWidth':
                    emptyEmailDetected && subscription.email.length === 0
                        ? 3
                        : undefined,
                'borderRadius': '6px',
                '&:hover': {
                    borderColor:
                        defaultOutlineColor_hovered[theme.palette.mode],
                },
                [`&:first-of-type`]: {
                    borderRadius: '6px',
                },
                [`&:last-of-type`]: {
                    borderRadius: '6px',
                },
            }}
        >
            <Stack
                direction="row"
                style={{
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <Summary
                    duplicateSubscriptionEmails={duplicateSubscriptionEmails}
                    expanded={subscription.viewing}
                    subscription={subscription}
                />

                <DeleteButton subscription={subscription} />
            </Stack>

            <Details subscription={subscription} />
        </Accordion>
    );
};

export default SubscriberInfo;
