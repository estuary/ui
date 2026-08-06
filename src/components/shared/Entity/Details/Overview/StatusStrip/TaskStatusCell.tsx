import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import {
    Link,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import ConnectorStatusDetail from 'src/components/shared/Entity/Details/Overview/StatusStrip/ConnectorStatusDetail';
import StripCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripCell';
import { useEntityType } from 'src/context/EntityContext';
import {
    diminishedTextColor,
    errorMain,
    successMain,
    warningMain,
} from 'src/context/Theme';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import {
    useShardDetail_dictionaryHydrated,
    useShardDetail_readDictionary,
} from 'src/stores/ShardDetail/hooks';
import { getPathWithParams } from 'src/utils/misc-utils';

const INDICATOR_SIZE = 8;

// Not "Shards". The product's own alert copy already calls this condition a
// Task Failure, and the shard concept is documented under /concepts/advanced/.
// A term that needs a tooltip to be understood is the wrong label, so the jargon
// stays in the Shard Information section below, where it is load-bearing.
interface Props {
    entityName: string;
    taskTypes: ShardEntityTypes[];
}

function TaskStatusCell({ entityName, taskTypes }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const entityType = useEntityType();

    const hydrated = useShardDetail_dictionaryHydrated();
    const { allShards, disabled, shardsHaveErrors, shardsHaveWarnings } =
        useShardDetail_readDictionary(entityName, taskTypes);

    const alertsPath = getPathWithParams(
        ENTITY_SETTINGS[entityType].routes.details.replace(
            'overview',
            'alerts'
        ),
        { [GlobalSearchParams.CATALOG_NAME]: entityName }
    );

    const state = disabled
        ? {
              color: diminishedTextColor[theme.palette.mode],
              labelId: 'detailsPanel.strip.status.disabled',
              unhealthy: false,
          }
        : shardsHaveErrors
          ? {
                color: errorMain,
                labelId: 'detailsPanel.strip.status.failed',
                unhealthy: true,
            }
          : shardsHaveWarnings
            ? {
                  color: warningMain,
                  labelId: 'detailsPanel.strip.status.warning',
                  unhealthy: true,
              }
            : {
                  color: successMain,
                  labelId: 'detailsPanel.strip.status.running',
                  unhealthy: false,
              };

    const label = intl.formatMessage(
        { id: state.labelId },
        { count: allShards.length }
    );

    return (
        <StripCell labelId="detailsPanel.strip.status">
            {hydrated ? (
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center' }}
                >
                    <span
                        style={{
                            backgroundColor: state.color,
                            borderRadius: '50%',
                            display: 'inline-block',
                            flex: 'none',
                            height: INDICATOR_SIZE,
                            width: INDICATOR_SIZE,
                        }}
                    />

                    {/* The status text is itself the link, so there is no
                        separate "see error" affordance competing with it: the
                        badge and its destination become the same place. */}
                    {state.unhealthy ? (
                        <Tooltip
                            placement="bottom"
                            title={intl.formatMessage({
                                id: 'detailsPanel.strip.status.viewAlerts',
                            })}
                        >
                            <Link
                                component={RouterLink}
                                to={alertsPath}
                                sx={{
                                    color: state.color,
                                    fontWeight: 500,
                                    textDecorationColor: 'currentcolor',
                                }}
                            >
                                {label}
                            </Link>
                        </Tooltip>
                    ) : (
                        <Typography
                            component="div"
                            sx={{ color: state.color, fontWeight: 500 }}
                        >
                            {label}
                        </Typography>
                    )}
                </Stack>
            ) : (
                <Skeleton height={24} width={90} />
            )}

            {/* Qualifies the state above it: a task is Running at the shard
                level for the whole of a backfill, and this is the line that
                says so. Its column is widened for it — see getStripGridSx. */}
            <ConnectorStatusDetail entityName={entityName} />
        </StripCell>
    );
}

export default TaskStatusCell;
