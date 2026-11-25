import type {
    AlertSubscriptionsQuery,
    AlertType,
    BillingAlertActiveQuery,
    BillingAlertConfigQuery,
    UpdateAlertConfigMutationMutation,
    UpdateAlertConfigMutationMutationVariables,
} from 'src/gql-types/graphql';

import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { getGqlUrl } from 'src/utils/env-utils';

const alertGraphql = graphql.link(getGqlUrl());

const rowData = (config: object | undefined): BillingAlertConfigQuery => ({
    alertConfigs: {
        __typename: 'AlertConfigEntryConnection',
        edges: config
            ? [
                  {
                      __typename: 'AlertConfigEntryEdge',
                      node: {
                          __typename: 'AlertConfigEntry',
                          id: '0011223344556677',
                          config,
                      },
                  },
              ]
            : [],
    },
});

// Serves acme/'s alert config row, applies each write to it like the server
// does, and records what was written and read.
export const handleSpendAlert = ({
    config,
    alertTypes = ['billing_threshold_exceeded'],
}: {
    config?: object;
    alertTypes?: AlertType[];
}) => {
    let row = config;
    const writes: UpdateAlertConfigMutationMutationVariables[] = [];
    const reads = { config: 0, subscriptions: 0 };

    server.use(
        alertGraphql.query<BillingAlertConfigQuery>(
            'BillingAlertConfig',
            () => {
                reads.config++;
                return HttpResponse.json({ data: rowData(row) });
            }
        ),
        alertGraphql.query<BillingAlertActiveQuery>('BillingAlertActive', () =>
            HttpResponse.json({
                data: { alerts: { __typename: 'AlertConnection', edges: [] } },
            })
        ),
        alertGraphql.query<AlertSubscriptionsQuery>(
            'AlertSubscriptions',
            () => {
                reads.subscriptions++;
                return HttpResponse.json({
                    data: {
                        alertSubscriptions: [
                            {
                                __typename: 'AlertSubscription',
                                alertTypes,
                                catalogPrefix: 'acme/',
                                email: 'ops@acme.co',
                            },
                        ],
                    },
                });
            }
        ),
        alertGraphql.mutation<
            UpdateAlertConfigMutationMutation,
            UpdateAlertConfigMutationMutationVariables
        >('UpdateAlertConfigMutation', ({ variables }) => {
            writes.push(variables);
            row = variables.config;
            return HttpResponse.json({
                data: {
                    updateAlertConfig: {
                        __typename: 'UpdateAlertConfigResult',
                        catalogPrefixOrName: variables.catalogPrefixOrName,
                    },
                },
            });
        })
    );

    return { reads, writes };
};
