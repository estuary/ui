import { useMemo } from 'react';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const GET_SECRET_QUERY = graphql(`
    query GetSecret($secretName: String!) {
        secrets(filter: { catalogName: { in: [$secretName] } }, first: 1) {
            edges {
                node {
                    catalogName
                    secretId
                }
            }
        }
    }
`);

export function useGetSecret(secretName: string) {
    const [{ data, fetching, error }] = useQuery({
        query: GET_SECRET_QUERY,
        variables: { secretName },
        // A cached miss could skip the overwrite warning
        requestPolicy: 'network-only',
        pause: !secretName,
    });

    const secret = useMemo(() => {
        return (
            data?.secrets.edges
                .map((edge) => edge.node)
                .find((node) => {
                    return node.catalogName === secretName;
                }) ?? null
        );
    }, [data?.secrets.edges, secretName]);

    return {
        secret,
        fetching,
        error,
    };
}
