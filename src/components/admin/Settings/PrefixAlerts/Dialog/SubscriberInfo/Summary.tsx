import type { SubscriberAccordionSummaryProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import {
    AccordionSummary,
    accordionSummaryClasses,
    Box,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowDown, NavArrowRight, WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';
import { useGetAlertTypes } from 'src/context/AlertType';
import { sortByAlertType } from 'src/utils/misc-utils';

const Summary = ({
    duplicateSubscriptionEmails,
    expanded,
    subscription,
}: SubscriberAccordionSummaryProps) => {
    const theme = useTheme();
    const intl = useIntl();

    const [alertTypeResponse] = useGetAlertTypes();

    const alertTypeDefs: AlertTypeInfo[] = useMemo(
        () =>
            !alertTypeResponse.data ? [] : alertTypeResponse.data.alertTypes,
        [alertTypeResponse.data]
    );

    const { alertTypes, email } = subscription;

    const evaluatedAlertTypes: ChipDisplay[] = useMemo(
        () =>
            alertTypes
                .map((alertType) =>
                    alertTypeDefs.find((def) => def.alertType === alertType)
                )
                .filter((def) => typeof def !== 'undefined')
                .sort((first, second) =>
                    sortByAlertType(
                        {
                            isSystemAlert: first.isSystem,
                            value: first.displayName,
                        },
                        {
                            isSystemAlert: second.isSystem,
                            value: second.displayName,
                        },
                        'asc'
                    )
                )
                .map(({ displayName, isSystem }) => ({
                    display: displayName,
                    diminishedText: isSystem,
                })),
        [alertTypeDefs, alertTypes]
    );

    const ineligibleSubscription =
        duplicateSubscriptionEmails.length > 0 &&
        duplicateSubscriptionEmails.includes(subscription.email);

    return (
        <AccordionSummary
            sx={{
                'minHeight': 40,
                'px': 1,
                '&:hover::after': {
                    backgroundColor: 'transparent',
                },
                [`& .${accordionSummaryClasses.content}`]: {
                    alignItems: 'center',
                    my: 1,
                    [`&.${accordionSummaryClasses.expanded}`]: {
                        my: 0,
                    },
                },
                [`&.${accordionSummaryClasses.expanded}`]: {
                    minHeight: 40,
                },
            }}
        >
            <Stack style={{ width: '100%' }}>
                <Stack direction="row" style={{ alignItems: 'center' }}>
                    {expanded ? (
                        <NavArrowDown
                            style={{ color: theme.palette.text.primary }}
                        />
                    ) : (
                        <NavArrowRight
                            style={{ color: theme.palette.text.primary }}
                        />
                    )}

                    <Typography style={{ fontWeight: 500, paddingLeft: 4 }}>
                        {email.length > 0
                            ? email
                            : intl.formatMessage({
                                  id: 'alerts.config.dialog.label.placeholderSubscriberId',
                              })}
                    </Typography>

                    {ineligibleSubscription ? (
                        <WarningCircle
                            style={{
                                color: theme.palette.error.main,
                                fontSize: 12,
                                marginLeft: 6,
                            }}
                        />
                    ) : null}
                </Stack>

                {expanded ? null : (
                    <Box style={{ paddingLeft: 12 }}>
                        <ChipList
                            maxChips={3}
                            stripPath={false}
                            values={evaluatedAlertTypes}
                        />
                    </Box>
                )}
            </Stack>
        </AccordionSummary>
    );
};

export default Summary;
