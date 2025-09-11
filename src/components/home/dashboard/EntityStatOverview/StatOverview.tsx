import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';

import { Stack, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import AlertingOverview from 'src/components/home/dashboard/AlertingOverview';
import ActiveEntityCount from 'src/components/home/dashboard/EntityStatOverview/ActiveEntityCount';
import Statistic from 'src/components/home/dashboard/EntityStatOverview/Statistic';
import LinkWrapper from 'src/components/shared/LinkWrapper';
import { ENTITY_SETTINGS } from 'src/settings/entity';

interface Props {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

export default function StatOverview({
    entityType,
    monthlyUsage,
    monthlyUsageError,
    monthlyUsageIndeterminate,
    monthlyUsageLoading,
}: Props) {
    const intl = useIntl();

    const {
        routes: { viewAll },
        termId: titleId,
        background,
        Icon,
    } = ENTITY_SETTINGS[entityType];

    return (
        <Stack spacing={2}>
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
                        marginBottom: 10,
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

                <AlertingOverview entityType={entityType} />
            </Stack>
        </Stack>
    );
}
