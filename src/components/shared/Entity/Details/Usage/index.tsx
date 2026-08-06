import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import DetailsRange from 'src/components/filters/DetailsRange';
import DataByHourGraph from 'src/components/graphs/DataByHourGraph';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import CardWrapper from 'src/components/shared/CardWrapper';
import RangeChip from 'src/components/shared/Entity/Details/Overview/RangeChip';
import {
    OVERVIEW_CARD_TITLE_SX,
    OVERVIEW_CARD_TITLE_WEIGHT,
} from 'src/components/shared/Entity/Details/Overview/shared';
import DelayWarning from 'src/components/shared/Entity/Details/Usage/DelayWarning';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import useDetailsStats from 'src/hooks/useDetailsStats';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const entityType = useEntityType();
    const range = useDetailsUsageStore((state) => state.range);
    const { isValidating, stats, error } = useDetailsStats(catalogName);

    // On a task the range picker has moved to the page toolbar, because it now
    // drives the status strip and the bindings table as well as this chart — a
    // page-level control has no business living inside one card's header. A
    // collection has only the chart, so the picker stays where it was.
    const ownsRangePicker = entityType === 'collection';

    return (
        <CardWrapper
            // Without this the card's floor is its content's min-content
            // width, which for a canvas is whatever width it currently is —
            // so a chart that has not yet shrunk holds the whole card open and
            // pushes it over its neighbour. Same trap as the bindings table.
            disableMinWidth
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                        // The heading inside DetailsRange inherits the app-wide
                        // `cardHeaderSx` weight of 300, which is too thin to
                        // read as a card title next to the chart.
                        [`& #hourly-filter-selector__label`]: {
                            fontWeight: OVERVIEW_CARD_TITLE_WEIGHT,
                        },
                    }}
                >
                    {ownsRangePicker ? (
                        <DetailsRange />
                    ) : (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                        >
                            <Typography
                                component="div"
                                sx={OVERVIEW_CARD_TITLE_SX}
                            >
                                <FormattedMessage id="detailsPanel.recentUsage.title.prefix" />
                            </Typography>

                            {/* The picker is up in the toolbar now, so the
                                chart states its own window the same way the
                                bindings card does. */}
                            <RangeChip range={range} />
                        </Stack>
                    )}

                    <StatTypeSelector />
                </Stack>
            }
        >
            {isValidating && !stats ? (
                <GraphLoadingState />
            ) : error ? (
                checkErrorMessage(FAILED_TO_FETCH, error.message) ? (
                    <EmptyGraphState
                        header={
                            <FormattedMessage id="entityTable.networkFailed.header" />
                        }
                        message={
                            <FormattedMessage id="entityTable.networkFailed.message" />
                        }
                    />
                ) : (
                    <Error error={error} />
                )
            ) : hasLength(stats) ? (
                <DataByHourGraph
                    id="data-by-hour_entity-details"
                    stats={stats}
                />
            ) : (
                <EmptyGraphState
                    message={
                        <FormattedMessage id="graphs.entityDetails.empty.message" />
                    }
                />
            )}

            <DelayWarning />
        </CardWrapper>
    );
}

export default Usage;
