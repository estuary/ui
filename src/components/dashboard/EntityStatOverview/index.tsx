import { Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import LinkWrapper from 'components/shared/LinkWrapper';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { Entity } from 'types';
import ActiveEntityCount from './ActiveEntityCount';
import MonthlyUsage from './MonthlyUsage';

interface Props {
    Icon: ReactElement;
    background: { light: string; dark: string };
    entityType: Entity;
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

export default function EntityStatOverview({
    Icon,
    background,
    entityType,
}: Props) {
    const route = getEntityPageURLPath(entityType);
    const titleId = getTitleId(entityType);

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
                    <FormattedMessage id="cta.goToEntityPage" />
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

                {entityType === 'capture' ||
                entityType === 'materialization' ? (
                    <MonthlyUsage byteUnit entityType={entityType} />
                ) : null}
            </Stack>
        </Stack>
    );
}
