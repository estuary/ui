import { graphql } from 'src/gql-types';

// Keep this standalone call so codegen finds the shared fragment.
graphql(`
    fragment PrivateLinkFields on PrivateLink {
        id
        status
        error
        details
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
                    fqdn
                    cidrBlocks
                    privateLinks {
                        ...PrivateLinkFields
                    }
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
            id
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
