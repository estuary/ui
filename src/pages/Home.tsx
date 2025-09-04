//TODO (UI / UX) - These icons are not final

import { authenticatedRoutes } from 'src/app/routes';
import Dashboard from 'src/components/home/dashboard';
import LoginError from 'src/components/home/LoginError';
import Welcome from 'src/components/home/Welcome';
import usePageTitle from 'src/hooks/usePageTitle';

// const alertHistoryQuery = gql<AlertHistoryQueryResponse, AlertsVariables>`
//     query AlertHistory($prefixes: [String!]!) {
//         alerts(prefixes: $prefixes) {
//             catalogName
//             firedAt
//             alertType
//             alertDetails: arguments
//             resolvedAt
//         }
//     }
// `;

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    // const intl = useIntl();
    // const selectedTenant = useTenantStore((state) => state.selectedTenant);

    return (
        <>
            <LoginError />

            <Welcome />

            <Dashboard />

            {/*            <Stack spacing={2} sx={{ m: 2 }}>
                <Box>
                    <Typography component="div" variant="h6" sx={{ mb: 0.5 }}>
                        {intl.formatMessage({
                            id: 'alerts.config.title',
                        })}
                    </Typography>
                    {intl.formatMessage({ id: 'alerts.config.message' })}
                </Box>

                <Divider />
                <AlertHistoryTable
                    tablePrefix={TablePrefixes.alertHistoryForTenant}
                    querySettings={{
                        query: alertHistoryQuery,
                        variables: {
                            prefixes: [selectedTenant],
                        },
                    }}
                />
            </Stack>*/}
        </>
    );
};

export default Home;
