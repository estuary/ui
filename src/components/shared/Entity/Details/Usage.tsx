import { Stack, Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import DataByHourGraph from 'components/graphs/DataByHourGraph';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

// const fakedata = [
//                             {
//                                 bytes_written_by_me: 10,
//                                 docs_written_by_me: 1,
//                                 ts: '12:00:00',
//                             },
//                             {
//                                 bytes_written_by_me: 50000000,
//                                 docs_written_by_me: 1000,
//                                 ts: '1:00:00',
//                             },
//                             {
//                                 bytes_written_by_me: 20000000,
//                                 docs_written_by_me: 2500,
//                                 ts: '2:00:00',
//                             },
//                             {
//                                 bytes_written_by_me: 25000000,
//                                 docs_written_by_me: 1250,
//                                 ts: '3:00:00',
//                             },
//                             {
//                                 bytes_written_by_me: 10000000,
//                                 docs_written_by_me: 3250,
//                                 ts: '4:00:00',
//                             },
//                             {
//                                 bytes_written_by_me: 35000000,
//                                 docs_written_by_me: 9930,
//                                 ts: '5:00:00',
//                             },
//                         ];

interface Props {
    catalogName: string;
}

function Usage({ catalogName }: Props) {
    const { isValidating, stats, error } = useDetailsStats(catalogName);

    console.log('stats', stats);

    return (
        <Stack direction="column" spacing={2} sx={{ m: 2 }}>
            <Stack direction="row" spacing={1}>
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <FormattedMessage id="detailsPanel.dataUsage.title" />
                </Typography>
            </Stack>
            {isValidating ? (
                <GraphLoadingState />
            ) : error ? (
                <Error error={error} />
            ) : !hasLength(stats) ? (
                <EmptyGraphState
                    message={
                        <FormattedMessage id="graphs.entityDetails.empty.message" />
                    }
                />
            ) : (
                <CardWrapper messageId="detailsPanel.recentUsage.title">
                    <DataByHourGraph stats={stats} />
                </CardWrapper>
            )}
        </Stack>
    );
}

export default Usage;
