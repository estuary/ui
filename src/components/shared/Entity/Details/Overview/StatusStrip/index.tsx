import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { Box, Skeleton, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import {
    getTaskFreshness,
    getTotalBytes,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import AutoDiscoverCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/AutoDiscoverCell';
import HeroValue from 'src/components/shared/Entity/Details/Overview/StatusStrip/HeroValue';
import {
    getStripGridSx,
    getSyncFrequency,
} from 'src/components/shared/Entity/Details/Overview/StatusStrip/shared';
import StripCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripCell';
import StripFooter from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripFooter';
import TaskStatusCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/TaskStatusCell';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { useEntityType } from 'src/context/EntityContext';
import useBindings from 'src/hooks/details/useBindings';
import useDetailsEntityTaskTypes from 'src/hooks/details/useDetailsEntityTaskTypes';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
}

/**
 * The page's status line: the facts about a task laid out horizontally under the
 * tabs, rather than as a right-hand rail.
 *
 * A status list is taller than a bar chart wants to be, so pairing the two side
 * by side always stranded a couple of hundred pixels of empty space beside the
 * shorter column. Running the same facts across the top removes the mismatch:
 * the chart and the bindings table both get the full width and nothing is left
 * over. Being the status line, it carries no card heading of its own.
 */
function StatusStrip({ entityName, latestLiveSpec }: Props) {
    const intl = useIntl();
    const entityType = useEntityType();
    const taskTypes = useDetailsEntityTaskTypes();

    // Shares its SWR key with the bindings table, so this is the same request —
    // and the same rows, which is why freshness below costs nothing to compute
    // and covers every binding rather than a sample of them.
    const { bindings, statsLoading } = useBindings(
        entityName,
        entityType,
        latestLiveSpec
    );

    const lastPublishedAt = getTaskFreshness(bindings);
    const syncFrequency = getSyncFrequency(latestLiveSpec?.spec);
    const isCapture = entityType !== 'materialization';

    if (!latestLiveSpec) {
        return (
            <CardWrapper disableMinWidth>
                <Stack direction="row" spacing={4}>
                    <Skeleton height={48} width="20%" />
                    <Skeleton height={48} width="20%" />
                    <Skeleton height={48} width="20%" />
                </Stack>
            </CardWrapper>
        );
    }

    const elapsed = lastPublishedAt ? getElapsed(lastPublishedAt) : null;

    // `prettyBytes` returns one string, "888.14 MB". Split so the hero can give
    // the figure its weight and leave the unit small beside it, the way the
    // other cards read.
    const [amount, ...unitParts] = formatBytes(getTotalBytes(bindings)).split(
        ' '
    );

    const dataMoved = { amount, unit: unitParts.join(' ') };

    // Freshness, data moved, task status — plus auto-discover on captures.
    // Drives the widest breakpoint's column count.
    const cellCount = isCapture ? 4 : 3;

    return (
        // Lets the strip narrow instead of forcing the page wider than the
        // viewport; the cells reflow to two columns and then stack.
        <CardWrapper disableMinWidth>
            <Box sx={getStripGridSx(cellCount)}>
                {/* The newest of every binding, not a sample and not an
                    average. Captures and materializations both, from the same
                    per-binding rows the table below uses.

                    Rounded to the minute because the reporting pipeline has a
                    floor of roughly four — see REPORTING_FLOOR_SECONDS. The
                    sync schedule rides alongside rather than in its own cell,
                    because a steady lag near its value is correct behaviour and
                    the two numbers are only meaningful together. */}
                <StripCell labelId="detailsPanel.strip.freshness">
                    {elapsed ? (
                        <HeroValue
                            note={
                                syncFrequency
                                    ? intl.formatMessage(
                                          {
                                              id: 'detailsPanel.strip.syncSchedule.inline',
                                          },
                                          { frequency: syncFrequency }
                                      )
                                    : undefined
                            }
                            tooltip={intl.formatMessage({
                                id: 'detailsPanel.strip.freshness.tooltip',
                            })}
                            unit={intl.formatMessage(
                                { id: elapsed.unitLabelId },
                                { count: elapsed.value }
                            )}
                            value={String(elapsed.value)}
                        />
                    ) : (
                        <HeroValue
                            loading={statsLoading}
                            tooltip={intl.formatMessage({
                                id: 'detailsPanel.strip.freshness.none.tooltip',
                            })}
                            unit=""
                            value={intl.formatMessage({
                                id: 'detailsPanel.strip.freshness.none',
                            })}
                        />
                    )}
                </StripCell>

                {/* Was a plain collection count, which the bindings card
                    heading and its filter chips both restate a couple of
                    hundred pixels below — the duplication decision #14 removed
                    from the rail. This is the number the chart beside it draws,
                    stated once as a figure, and it means the same thing on both
                    entity types where "collections" and "bindings" did not. */}
                <StripCell labelId="detailsPanel.strip.dataMoved">
                    <HeroValue
                        tooltip={intl.formatMessage({
                            id: 'detailsPanel.strip.dataMoved.tooltip',
                        })}
                        unit={dataMoved.unit}
                        value={dataMoved.amount}
                    />
                </StripCell>

                {isCapture ? (
                    <AutoDiscoverCell entityName={entityName} />
                ) : null}

                <TaskStatusCell entityName={entityName} taskTypes={taskTypes} />
            </Box>

            {/* Outside the grid, so it spans the full width without having to
                claim a column and without the grid's divider rules counting it
                as a cell. */}
            <StripFooter latestLiveSpec={latestLiveSpec} />
        </CardWrapper>
    );
}

export default StatusStrip;
