import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type {
    ActiveAlertsQueryResponse,
    Alert,
    AlertsVariables,
} from 'src/types/gql';

import { useMemo } from 'react';

import { Divider, LinearProgress, Stack, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import ActiveEntityCount from 'src/components/home/dashboard/EntityStatOverview/ActiveEntityCount';
import Statistic from 'src/components/home/dashboard/EntityStatOverview/Statistic';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import ChipList from 'src/components/shared/ChipList';
import KeyValueList from 'src/components/shared/KeyValueList';
import LinkWrapper from 'src/components/shared/LinkWrapper';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useTenantStore } from 'src/stores/Tenant/Store';

interface Props {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

const testQuery = gql<ActiveAlertsQueryResponse, AlertsVariables>`
    query ActiveAlertsQuery($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertDetails: arguments
            alertType
            catalogName
            firedAt
            resolvedAt
        }
    }
`;

export default function StatOverview({
    entityType,
    monthlyUsage,
    monthlyUsageError,
    monthlyUsageIndeterminate,
    monthlyUsageLoading,
}: Props) {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ fetching, data }] = useQuery({
        query: testQuery,
        variables: { prefixes: [selectedTenant] },
        pause: !selectedTenant,
    });

    const {
        routes: { viewAll },
        termId: titleId,
        background,
        Icon,
    } = ENTITY_SETTINGS[entityType];

    const getAlertTypeContent = useAlertTypeContent();

    const filteredData = useMemo(() => {
        const entityData = data?.alerts.filter((datum) => {
            return datum.alertDetails.spec_type === entityType;
        });

        const response: { [catalogName: string]: Alert[] } = {};

        entityData?.forEach((datum, index) => {
            response[datum.catalogName] ??= [];

            response[datum.catalogName].push(datum);
        });

        return response;
    }, [data?.alerts, entityType]);

    const renderedAlerts = useMemo(() => {
        const foo = Object.entries(filteredData);

        if (foo.length > 0) {
            return foo.map(([catalogName, datum], index) => {
                return (
                    <KeyValueList
                        key={`alert-${datum[0].catalogName}-${index}`}
                        data={[
                            {
                                title: datum[0].catalogName,
                                val: (
                                    <ChipList
                                        stripPath={false}
                                        values={datum.map((foo) => {
                                            const { humanReadable } =
                                                getAlertTypeContent(foo);
                                            return humanReadable;
                                        })}
                                    />
                                ),
                            },
                        ]}
                    />

                    // LISTING IN ALERT BOX
                    // <AlertBox
                    //     short
                    //     severity="warning"
                    //     key={`alert-${datum[0].catalogName}-${index}`}
                    //     title={datum[0].catalogName}
                    // >
                    //     {datum.map((foo, index) => {
                    //         const { humanReadable } = getAlertTypeContent(foo);

                    //         return (
                    //             <KeyValueList
                    //                 key={`alert-list-${datum[0].catalogName}-${foo.alertType}-${index}`}
                    //                 data={[
                    //                     {
                    //                         title: humanReadable,
                    //                         val: `started ${DateTime.fromISO(
                    //                             foo.firedAt
                    //                         )
                    //                             .toUTC()
                    //                             .toLocaleString(
                    //                                 DateTime.DATETIME_FULL
                    //                             )}`,
                    //                     },
                    //                 ]}
                    //             />
                    //         );

                    //         // return (
                    //         //     <Stack
                    //         //         direction="row"
                    //         //         spacing={1}
                    //         //         key={`alert-list-${datum[0].catalogName}-${foo.alertType}-${index}`}
                    //         //     >
                    //         //         <Box sx={{ fontWeight: 700 }}>
                    //         //             {humanReadable}
                    //         //         </Box>
                    //         //         <Box>
                    //         //             started{' '}
                    //         //             {DateTime.fromISO(foo.firedAt)
                    //         //                 .toUTC()
                    //         //                 .toLocaleString(
                    //         //                     DateTime.DATETIME_FULL
                    //         //                 )}
                    //         //         </Box>
                    //         //     </Stack>
                    //         // );
                    //     })}
                    // </AlertBox>
                );
            });
        }

        return (
            <AlertBox short severity="success">
                No Alerts!
            </AlertBox>
        );
    }, [filteredData, getAlertTypeContent]);

    console.log('data', data);

    return (
        <Stack
            spacing={2}
            sx={{
                background: (theme) => background[theme.palette.mode],
                borderRadius: 3,
                pb: 2,
                pl: 2,
                pr: 1,
                pt: 1,
            }}
        >
            <Stack
                direction="row"
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    style={{ alignItems: 'center' }}
                >
                    <Icon style={{ fontSize: 12 }} />

                    <Typography style={{ fontWeight: 500 }}>
                        <FormattedMessage id={titleId} />
                    </Typography>
                </Stack>

                <LinkWrapper link={viewAll}>
                    <FormattedMessage id="cta.goToAll" />
                </LinkWrapper>
            </Stack>

            <Stack
                direction="row"
                style={{
                    alignContent: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <ActiveEntityCount entityType={entityType} />

                {typeof monthlyUsage === 'number' ? (
                    <Statistic
                        byteUnit
                        error={monthlyUsageError}
                        indeterminate={monthlyUsageIndeterminate}
                        label={intl.formatMessage({
                            id: 'filter.time.thisMonth',
                        })}
                        loading={monthlyUsageLoading ?? false}
                        tooltip={`${monthlyUsage} ${intl.formatMessage({
                            id:
                                entityType === 'materialization'
                                    ? `entityTable.stats.bytes_read`
                                    : `entityTable.stats.bytes_written`,
                        })}`}
                        value={monthlyUsage}
                    />
                ) : null}
            </Stack>

            <Divider />
            <CardWrapper message="Active Alerts">
                <Stack
                    spacing={2}
                    sx={{
                        ['& .MuiListItemText-root']: {
                            display: 'contents',
                        },
                    }}
                >
                    {fetching ? <LinearProgress /> : null}
                    {renderedAlerts}
                </Stack>
            </CardWrapper>
        </Stack>
    );
}
