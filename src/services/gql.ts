import { graphql } from 'src/gql-types';

export const PAGE_INFO_FRAGMENT = graphql(`
    fragment PageInfoFields on PageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
    }
`);

export const ERROR_MESSAGES = {
    unauthorized: '[Network] Unauthorized',
};
