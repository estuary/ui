import { Box, LinearProgress } from '@mui/material';

import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
import { stringifyJSON } from 'src/services/stringify';

const AlertHistoryQuery = gql`
    query ($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            catalogName
            firedAt
            alertType
            arguments
            resolvedAt
        }
    }
`;

function AlertHistoryTable() {
    const [{ fetching, data, error }] = useQuery({
        query: AlertHistoryQuery,
        variables: { prefixes: ['fee_fi_foo_fm/'] },
    });

    if (error) {
        return (
            <AlertBox severity="error" short>
                {error}
            </AlertBox>
        );
    }

    return (
        <Box>
            {fetching ? (
                <LinearProgress />
            ) : (
                <textarea value={stringifyJSON(data)} rows={25} cols={100} />
            )}
        </Box>
    );
}

export default AlertHistoryTable;
