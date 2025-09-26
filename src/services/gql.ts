import { gql } from 'urql';

export const PAGE_INFO_FRAGMENT = gql`
    fragment PageInfo on PageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
    }
`;

export const ERROR_MESSAGES = {
    unauthorized: '[Network] Unauthorized',
};

export const tokenHasIssues_GQL = (errorMessage?: string) => {
    return errorMessage && errorMessage === ERROR_MESSAGES.unauthorized;
};
