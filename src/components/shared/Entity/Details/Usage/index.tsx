import { Stack } from '@mui/material';

import DelayWarning from './DelayWarning';
import { FormattedMessage } from 'react-intl';

import DetailsRange from 'src/components/filters/DetailsRange';
import DataByHourGraph from 'src/components/graphs/DataByHourGraph';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import CardWrapper from 'src/components/shared/CardWrapper';
import Error from 'src/components/shared/Error';
import useDetailsStats from 'src/hooks/useDetailsStats';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const { isValidating, stats, error } = useDetailsStats(catalogName);

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <DetailsRange />
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
