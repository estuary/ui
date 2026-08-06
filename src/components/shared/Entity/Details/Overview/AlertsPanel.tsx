import type { AlertNode } from 'src/types/gql';

import { alpha, Box, Link, Stack, Typography, useTheme } from '@mui/material';

import { CheckCircle, NavArrowRight } from 'iconoir-react';
import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import CardWrapper from 'src/components/shared/CardWrapper';
import { OVERVIEW_CARD_TITLE_SX } from 'src/components/shared/Entity/Details/Overview/shared';
import { useEntityType } from 'src/context/EntityContext';
import { diminishedTextColor, errorMain, successMain } from 'src/context/Theme';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { getPathWithParams } from 'src/utils/misc-utils';

const DOT_SIZE = 8;

interface Props {
    alerts: AlertNode[];
    entityName: string;
}

/**
 * The task's alerts, beside the usage chart.
 *
 * Always present: a green tick when nothing is firing, the firing alerts
 * themselves when something is. That reverses decision #9, which allowed no
 * permanent alerts surface on the grounds that a line reading "nothing is
 * wrong" for weeks teaches people to stop looking. Sean's call: a signal you
 * have to go and find is worth less than one that is always in the same place,
 * and a tick states the page was checked rather than that nobody looked.
 *
 * It replaced a banner rather than joining one, so Overview still carries a
 * single alerts surface, alongside the Alerts tab's count badge.
 */
function AlertsPanel({ alerts, entityName }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const entityType = useEntityType();

    const firing = alerts.length > 0;

    const alertsPath = getPathWithParams(
        ENTITY_SETTINGS[entityType].routes.details.replace(
            'overview',
            'alerts'
        ),
        { [GlobalSearchParams.CATALOG_NAME]: entityName }
    );

    return (
        <CardWrapper
            disableMinWidth
            // Deliberately not stretched to the chart's height. Matching it was
            // tried: with nothing firing the panel becomes a tall box holding
            // one line, which draws more attention to the empty state than to
            // the chart. Sized to content, it stays quiet when quiet.
            message={
                <Typography component="span" sx={OVERVIEW_CARD_TITLE_SX}>
                    {intl.formatMessage({
                        id: 'detailsPanel.alerts.panel.title',
                    })}
                </Typography>
            }
        >
            <Stack spacing={1.5}>
                {firing ? (
                    alerts.map((alert) => (
                        <Stack
                            key={`${alert.alertType}-${alert.firedAt}`}
                            direction="row"
                            spacing={1.5}
                            // The dot sits on the card itself, outside the
                            // tinted block, and centres against it — so it
                            // reads against the plain card background rather
                            // than against the red it is made of.
                            sx={{ alignItems: 'center' }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: errorMain,
                                    borderRadius: '50%',
                                    flex: 'none',
                                    height: DOT_SIZE,
                                    width: DOT_SIZE,
                                }}
                            />

                            {/* The whole alert is the link, rather than a
                                separate "View in Alerts" beneath the list: with
                                more than one firing, a single shared link
                                cannot say which alert it leads to. */}
                            <Link
                                component={RouterLink}
                                to={alertsPath}
                                sx={{
                                    // A tint rather than a fill: several of
                                    // these stacked in a solid error colour
                                    // would read as one large red block instead
                                    // of a list.
                                    'backgroundColor': alpha(
                                        errorMain,
                                        theme.palette.mode === 'light'
                                            ? 0.06
                                            : 0.12
                                    ),
                                    'alignItems': 'center',
                                    // Same radius as the cards, so the items
                                    // nest inside the panel rather than looking
                                    // like a different kind of thing.
                                    'borderRadius': 3,
                                    'color': 'inherit',
                                    'columnGap': 1,
                                    'display': 'flex',
                                    'flex': 1,
                                    'minWidth': 0,
                                    'px': 1.5,
                                    'py': 1.25,
                                    'textDecoration': 'none',
                                    '&:hover': {
                                        backgroundColor: alpha(
                                            errorMain,
                                            theme.palette.mode === 'light'
                                                ? 0.11
                                                : 0.2
                                        ),
                                    },
                                }}
                            >
                                {/* `flex: 1` so the title row can push its
                                    timestamp to the right edge, `minWidth: 0`
                                    so a long error wraps instead of widening
                                    the row. */}
                                <Stack
                                    spacing={0.5}
                                    sx={{ flex: 1, minWidth: 0 }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Typography
                                            component="div"
                                            sx={{
                                                color: errorMain,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {intl.formatMessage({
                                                id: `alerts.alertType.humanReadable.${alert.alertType}`,
                                            })}
                                        </Typography>

                                        {alert.firedAt ? (
                                            <Typography
                                                component="div"
                                                sx={{
                                                    color: diminishedTextColor[
                                                        theme.palette.mode
                                                    ],
                                                    flex: 'none',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {DateTime.fromISO(
                                                    alert.firedAt
                                                ).toRelative()}
                                            </Typography>
                                        ) : null}
                                    </Stack>

                                    {/* Every firing alert gets its error, not just
                                    the first: a task that has both failed and
                                    stalled should not read as though one thing
                                    is wrong. The banner this replaced could
                                    only ever show one. */}
                                    {alert.alertDetails?.error ? (
                                        <Typography
                                            component="div"
                                            sx={{
                                                color: diminishedTextColor[
                                                    theme.palette.mode
                                                ],
                                                fontSize: 13,
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {alert.alertDetails.error}
                                        </Typography>
                                    ) : null}
                                </Stack>

                                <NavArrowRight
                                    aria-hidden
                                    style={{
                                        color: errorMain,
                                        flex: 'none',
                                        fontSize: 18,
                                    }}
                                />
                            </Link>
                        </Stack>
                    ))
                ) : (
                    // Left aligned, matching where the firing alerts start, so
                    // the card's content does not jump across when an alert
                    // arrives. With the header dot gone this tick is the whole
                    // healthy signal.
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <CheckCircle
                            aria-hidden
                            style={{ color: successMain, fontSize: 14 }}
                        />

                        <Typography
                            component="div"
                            sx={{
                                color: diminishedTextColor[theme.palette.mode],
                            }}
                        >
                            {intl.formatMessage({
                                id: 'detailsPanel.alerts.panel.none',
                            })}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </CardWrapper>
    );
}

export default AlertsPanel;
