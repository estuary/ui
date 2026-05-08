import type { SubscriberSummaryProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import {
    AccordionSummary,
    accordionSummaryClasses,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowDown } from 'iconoir-react';

import ChipList from 'src/components/shared/ChipList';
import { useGetAlertTypes } from 'src/context/AlertType';
import { defaultOutline, defaultOutlineColor_hovered } from 'src/context/Theme';
import { sortByAlertType } from 'src/utils/misc-utils';

const Summary = ({
    alertTypes,
    email,
    expanded,
    setHovered,
}: SubscriberSummaryProps) => {
    const theme = useTheme();

    const [alertTypeResponse] = useGetAlertTypes();

    const alertTypeDefs: AlertTypeInfo[] = useMemo(
        () =>
            !alertTypeResponse.data ? [] : alertTypeResponse.data.alertTypes,
        [alertTypeResponse.data]
    );

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

    return (
        <AccordionSummary
            expandIcon={
                <NavArrowDown style={{ color: theme.palette.text.primary }} />
            }
            onMouseOver={() => setHovered(true)}
            onMouseOut={() => setHovered(false)}
            sx={{
                'backgroundColor':
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                'border': defaultOutline[theme.palette.mode],
                'borderBottom': expanded ? 'none' : undefined,
                'borderRadius': 3,
                'borderBottomLeftRadius': expanded ? 'unset' : undefined,
                'borderBottomRightRadius': expanded ? 'unset' : undefined,
                'minHeight': 40,
                'px': 1,
                '&:hover': {
                    borderColor:
                        defaultOutlineColor_hovered[theme.palette.mode],
                },
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
            <Stack spacing="2px" style={{ marginRight: 24 }}>
                <Typography style={{ fontWeight: 500, paddingLeft: 12 }}>
                    {email}
                </Typography>

                {expanded ? null : (
                    <ChipList
                        maxChips={3}
                        stripPath={false}
                        values={evaluatedAlertTypes}
                    />
                )}
            </Stack>
        </AccordionSummary>
    );
};

export default Summary;
