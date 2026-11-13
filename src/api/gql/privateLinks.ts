import { graphql } from 'src/gql-types';

// Only registers the fragment with codegen. The query and the mutations share
// it, so a saved link carries every field the list and dialogs read.
graphql(`
    fragment PrivateLinkFields on PrivateLink {
        id
        status
        error
        details
        observedAt
        config {
            __typename
            ... on AWSPrivateLink {
                serviceName
                region
                serviceRegion
                azIds
            }
            ... on AzurePrivateLink {
                serviceName
                location
                resourceType
                dnsName
            }
            ... on GCPPrivateServiceConnect {
                serviceAttachment
                region
                dnsZoneName
                dnsRecordNames
                allPorts
            }
        }
    }
`);

// Private links belong to private data planes, which the `tenant` filter
// selects. A tenant has a handful of them at most, so one page is all of them.
export const PRIVATE_LINKS_QUERY = graphql(`
    query DataPlanePrivateLinks($tenant: String!) {
        dataPlanes(
            filter: { tenant: { eq: $tenant }, public: { eq: false } }
            first: 100
        ) {
            edges {
                node {
                    name
                    cloudProvider
                    region
                    privateLinks {
                        ...PrivateLinkFields
                    }
                }
            }
        }
    }
`);

// What the user may do with a data plane's links comes from the capability
// bundles they hold on its name, which a grant on any prefix of that name can
// carry: the tenant's data planes prefix, one within it, or one above it.
// `none` keeps grants that carry only bundles.
export const PRIVATE_LINK_CAPABILITIES_QUERY = graphql(`
    query PrivateLinkCapabilities($above: [String!]!, $within: String!) {
        above: prefixes(
            by: { minCapability: none }
            filter: { prefix: { in: $above } }
        ) {
            edges {
                node {
                    prefix
                    capabilities
                }
            }
        }
        within: prefixes(
            by: { minCapability: none }
            filter: { prefix: { startsWith: $within } }
        ) {
            edges {
                node {
                    prefix
                    capabilities
                }
            }
        }
    }
`);

export const ADD_PRIVATE_LINK = graphql(`
    mutation AddDataPlanePrivateLink(
        $dataPlaneName: String!
        $config: PrivateLinkConfigInput!
    ) {
        addDataPlanePrivateLink(
            dataPlaneName: $dataPlaneName
            config: $config
        ) {
            ...PrivateLinkFields
        }
    }
`);

export const UPDATE_PRIVATE_LINK = graphql(`
    mutation UpdateDataPlanePrivateLink(
        $id: Id!
        $config: PrivateLinkConfigInput!
    ) {
        updateDataPlanePrivateLink(id: $id, config: $config) {
            ...PrivateLinkFields
        }
    }
`);

export const REMOVE_PRIVATE_LINK = graphql(`
    mutation RemoveDataPlanePrivateLink($id: Id!) {
        removeDataPlanePrivateLink(id: $id)
    }
`);
