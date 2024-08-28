import { Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { authenticatedRoutes } from 'app/routes';
import LinkWrapper from 'components/shared/LinkWrapper';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import { ReactElement } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Entity } from 'types';
import ActiveEntityCount from './ActiveEntityCount';
import Statistic from './Statistic';

interface Props {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageLoading?: boolean;
}

const getEntityPageURLPath = (entityType: string): string => {
    if (entityType === 'collection') {
        return authenticatedRoutes.collections.fullPath;
    }

    if (entityType === 'capture') {
        return authenticatedRoutes.captures.fullPath;
    }

    return authenticatedRoutes.materializations.fullPath;
};

const getTitleId = (entityType: string): string => {
    if (entityType === 'collection') {
        return 'terms.collections';
    }

    if (entityType === 'capture') {
        return 'terms.sources';
    }

    return 'terms.destinations';
};

const getBackgroundColor = (
    entityType: string
): { dark: string; light: string } => {
    if (entityType === 'collection') {
        return semiTransparentBackground_blue;
    }

    if (entityType === 'capture') {
        return semiTransparentBackground_teal;
    }

    return semiTransparentBackground_purple;
};

const getEntityIcon = (entityType: string): ReactElement => {
    const iconSize = 12;

    if (entityType === 'collection') {
        return <DatabaseScript fontSize={iconSize} />;
    }

    if (entityType === 'capture') {
        return <CloudUpload fontSize={iconSize} />;
    }

    return <CloudDownload fontSize={iconSize} />;
};

export default function StatOverview({
    entityType,
    monthlyUsage,
    monthlyUsageError,
    monthlyUsageLoading,
}: Props) {
    const intl = useIntl();

    const route = getEntityPageURLPath(entityType);
    const titleId = getTitleId(entityType);

    const background = getBackgroundColor(entityType);
    const Icon = getEntityIcon(entityType);

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
                    {Icon}

                    <Typography style={{ fontWeight: 500 }}>
                        <FormattedMessage id={titleId} />
                    </Typography>
                </Stack>

                <LinkWrapper link={route}>
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
        </Stack>
    );
}
