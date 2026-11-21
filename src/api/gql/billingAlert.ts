import { graphql } from 'src/gql-types';

// The tenant prefix's own row. `updateAlertConfig` replaces a row's whole
// `config`, so a write merges into what this reads.
export const BILLING_ALERT_CONFIG_QUERY = graphql(`
    query BillingAlertConfig($tenant: String!) {
        alertConfigs(filter: { catalogPrefixOrName: { in: [$tenant] } }) {
            edges {
                node {
                    id
                    config
                }
            }
        }
    }
`);

// `name` is the alert's own catalog name, so the tenant's task alerts can't
// push it off the first page.
export const BILLING_ALERT_ACTIVE_QUERY = graphql(`
    query BillingAlertActive($name: String!) {
        alerts(by: { prefix: $name, active: true }) {
            edges {
                node {
                    alertType
                    arguments
                    firedAt
                }
            }
        }
    }
`);
