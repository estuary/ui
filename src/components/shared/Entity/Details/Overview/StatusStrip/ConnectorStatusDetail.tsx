import { Link, Tooltip, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import { useEntityType } from 'src/context/EntityContext';
import { diminishedTextColor } from 'src/context/Theme';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { getPathWithParams } from 'src/utils/misc-utils';

// Two lines, then ellipsis. The strip's cells stretch to match the tallest, so
// an unbounded message would set the height of the whole row.
const MAX_LINES = 2;

interface Props {
    entityName: string;
}

/**
 * What the connector says it is doing, beneath the shard state it qualifies.
 *
 * These are two different facts and the pairing is the point: a task is
 * Running at the shard level for the entire duration of a backfill, so
 * "Running" alone can describe a task that is hours from usable. This is the
 * line that says which.
 *
 * It lives inside the Status cell rather than in a band of its own. A
 * full-width band was tried and read badly — a third stripe across the card, a
 * void beside short messages, and a label/value treatment that matched nothing
 * else on the strip.
 *
 * The message is itself the link to the Logs tab, which mounts the full
 * connector status surface. That is decision #10's shape, and the same thing
 * TaskStatusCell does immediately above — a trailing "Details" link would also
 * have been pushed onto a third line by the clamp, defeating it.
 */
function ConnectorStatusDetail({ entityName }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const entityType = useEntityType();

    const message =
        useEntityStatusStore_singleResponse(entityName)?.connector_status
            ?.message;

    // Render nothing rather than an empty line: a task can be published before
    // it has reported anything.
    if (!message) {
        return null;
    }

    const statusPath = getPathWithParams(
        ENTITY_SETTINGS[entityType].routes.details.replace('overview', 'ops'),
        { [GlobalSearchParams.CATALOG_NAME]: entityName }
    );

    return (
        <Tooltip
            placement="bottom-start"
            title={intl.formatMessage(
                { id: 'detailsPanel.strip.connectorStatus.tooltip' },
                { message }
            )}
        >
            <Link
                component={RouterLink}
                to={statusPath}
                sx={{
                    // Quiet: it qualifies the status above rather than
                    // competing with it, so it takes body colour and carries a
                    // matching underline instead of the link blue.
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: MAX_LINES,
                    color: diminishedTextColor[theme.palette.mode],
                    display: '-webkit-box',
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    overflow: 'hidden',
                    // Never underlined, hover included: a whole paragraph of
                    // connector prose with a rule under it is hard to read, and
                    // it sits directly beneath the shard state, which carries
                    // its own underline when unhealthy. Hover darkens the text
                    // instead, which is affordance enough for a line whose
                    // destination is stated by the card it sits in.
                    textDecoration: 'none',
                    ['&:hover']: {
                        color: theme.palette.text.primary,
                        textDecoration: 'none',
                    },
                }}
            >
                {message}
            </Link>
        </Tooltip>
    );
}

export default ConnectorStatusDetail;
